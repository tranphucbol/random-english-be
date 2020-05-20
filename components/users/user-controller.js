const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("../../config");
const User = require("./users");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const userVerifyToken = require("./user-verify-token");

router.post("/login", async (req, res) => {
    let { email, password } = req.body;
    console.log(email, password);
    try {
        let user = await User.findOne({
            where: {
                email: email,
            },
        });
        if (user) {
            const isExist = await bcrypt.compare(password, user.password);
            if (!isExist)
                return res
                    .status(400)
                    .json({ status: 0, message: "Wrong email or password" });
            const token = jwt.sign(
                { email, name: user.name },
                config.tokenSecret,
                {
                    expiresIn: config.tokenLife,
                }
            );
            return res.json({
                status: 1,
                data: { email, name: user.name, numberPhone: numberPhone, token },
            });
        } else {
            return res
                .status(400)
                .json({ status: 0, message: "Wrong email or password" });
        }
    } catch (err) {
        console.error(err);
        return res
            .status(400)
            .json({ status: 0, message: "Something went wrong" });
    }
});

router.post("/register", async (req, res) => {
    let { email, password, name, numberPhone } = req.body;
    if(!email || !password || !name || !numberPhone) {
        return res
            .status(400)
            .json({ status: 0, message: "Invalid Parameter" });
    }
    try {
        let hashedPassword = await bcrypt.hash(password, saltRounds);
        let user = { email, password: hashedPassword, name: name, numberPhone: numberPhone };
        await User.create(user);
        const token = jwt.sign({ email, name }, config.tokenSecret, {
            expiresIn: config.tokenLife,
        });
        return res.json({
            status: 1,
            data: { email, name, numberPhone, token },
        });
    } catch (err) {
        console.error(err);
        return res
            .status(400)
            .json({ status: 0, message: "This Email was already used" });
    }
});

router.post("/profile", userVerifyToken, async (req, res) => {
    const { email, name } = req.user;
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

module.exports = router;
