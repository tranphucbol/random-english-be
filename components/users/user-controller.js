const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("../../config");
const User = require("./users");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const userVerifyToken = require("./user-verify-token");
const { sendVerifyUserMail, sendResetPasswordMail } = require("../../utils");

router.post("/login", async (req, res) => {
  let { email, password } = req.body;
  try {
    let user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (user) {
      if (!user.enabled) {
        return res
          .status(400)
          .json({ status: 0, message: "User has not verified yet" });
      }
      const isExist = await bcrypt.compare(password, user.password);
      if (!isExist)
        return res
          .status(400)
          .json({ status: 0, message: "Wrong email or password" });
      const token = jwt.sign(
        { userId: user.id, email, name: user.name },
        config.tokenSecret,
        {
          expiresIn: config.tokenLife,
        }
      );
      return res.json({
        status: 1,
        data: {
          id: user.id,
          email,
          name: user.name,
          numberPhone: user.numberPhone,
          token,
        },
      });
    } else {
      return res
        .status(400)
        .json({ status: 0, message: "Wrong email or password" });
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

router.post("/register", async (req, res) => {
  let { email, password, name, numberPhone } = req.body;
  if (!email || !password || !name || !numberPhone) {
    return res.status(400).json({ status: 0, message: "Invalid Parameter" });
  }
  try {
    let hashedPassword = await bcrypt.hash(password, saltRounds);
    let user = {
      email,
      password: hashedPassword,
      name: name,
      numberPhone: numberPhone,
    };
    let createdUser = await User.create(user);
    const token = jwt.sign(
      { id: createdUser.id, email, name },
      config.tokenSecret,
      {
        expiresIn: config.tokenLife,
      }
    );

    try {
      const tokenEmail = jwt.sign({ email }, config.tokenMailSecret, {
        expiresIn: config.tokenMailLife,
      });
      await sendVerifyUserMail(email, tokenEmail);
    } catch (err) {
      console.log(err);
    }
    

    return res.json({
      status: 1,
      data: { id: createdUser.id, email, name, numberPhone, token },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ status: 0, message: "This Email was already used" });
  }
});

router.post("/profile", userVerifyToken, async (req, res) => {
  const { email } = req.user;
  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (user) {
      res.json({
        status: 1,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          numberPhone: user.numberPhone,
        },
      });
    } else {
      res.status(400).json({ status: 0, message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

router.post("/resend-verify-user-mail", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user === null) {
      res.status(400).json({ status: 0, message: "User not found" });
    } else {
      if (user.enabled) {
        res
          .status(400)
          .json({ status: 0, message: "User has already verified" });
      } else {
        const token = jwt.sign({ email }, config.tokenMailSecret, {
          expiresIn: config.tokenMailLife,
        });
        await sendVerifyUserMail(email, token);
        res.json({
          status: 1,
          message: "Send mail successfully, Please check your email",
        });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

router.post("/verify-mail", async (req, res) => {
  try {
    const { token } = req.body;
    const { email } = await jwt.verify(token, config.tokenMailSecret);
    const user = await User.findOne({ where: { email } });
    if (user === null) {
      res.status(400).json({ status: 0, message: "User not found" });
    } else {
      user.enabled = true;
      await user.save();
      res.json({ status: 1, message: "Verify successfully" });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

router.post("/change-password", userVerifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { userId } = req.user;
    const user = await User.findOne({ where: { id: userId } });
    const isExist = await bcrypt.compare(oldPassword, user.password);
    if (!isExist) {
      res
        .status(400)
        .json({ status: 0, message: "Old Password does not match" });
    } else {
      let hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password = hashedPassword;
      await user.save();
      res.json({ status: 1, message: "Changed password successfully" });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

router.post("/resend-reset-password-mail", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user === null) {
      res.status(400).json({ status: 0, message: "User not found" });
    } else {
      const token = jwt.sign({ email }, config.tokenResetPasswordSecret, {
        expiresIn: config.tokenResetPasswordLife,
      });
      await sendResetPasswordMail(email, token);
      res.json({
        status: 1,
        message: "Send mail successfully, Please check your email",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const { email } = await jwt.verify(token, config.tokenResetPasswordSecret);
    const user = await User.findOne({ where: { email } });
    if (user === null) {
      res.status(400).json({ status: 0, message: "User not found" });
    } else {
      let hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password = hashedPassword;
      await user.save();
      res.json({ status: 1, message: "Reset password successfully" });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

module.exports = router;
