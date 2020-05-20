const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("../../config");
const User = require("./users");
const bcrypt = require("bcrypt");
const saltRounds = 10;

router.post("/login", async (req, res) => {
    let { email, password } = req.body;
    try {
        let user = await User.findOne({
            where: {
                email: email
            },
        });
        if (user) {
            const isExist = await bcrypt.compare(password, user.password);
            if(!isExist) return res.status(400).json({ message: "Wrong email or password" });
            const token = jwt.sign({ email }, config.tokenSecret, {
                expiresIn: config.tokenLife,
            });
            return res.json({ email, token });
        } else {
            return res.status(400).json({ message: "Wrong email or password" });
        }
    } catch (err) {
        console.error(err);
        return res.status(400).json({message: "Something went wrong"});
    }
  
});

router.post("/register", async (req, res) => {
    let { email, password } = req.body;
    try {
        let hashedPassword = await bcrypt.hash(password, saltRounds);
        let user = { email, password: hashedPassword };
        await User.create(user);
        const token = jwt.sign(user, config.tokenSecret, {
            expiresIn: config.tokenLife,
        });
        res.json({ email, token });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "This Email was already used" });
    }
});

module.exports = router;
