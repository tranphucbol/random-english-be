const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("../../config");
const User = require("./users");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const userVerifyToken = require("./user-verify-token");
const { sendVerifyUserMail } = require("../../utils");

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

router.get("/verify-mail/:token", async (req, res) => {
  try {
    const { token } = req.params;
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

module.exports = router;
