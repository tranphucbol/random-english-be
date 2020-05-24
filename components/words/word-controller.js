const express = require("express");
const router = express.Router();
const userVerifyToken = require("../users/user-verify-token");
const Word = require("./words");
const { random } = require("../../utils");

router.post("/random", userVerifyToken,  async (req, res) => {
  try {
    const count = await Word.count();
    let word;
    do {
      word = await Word.findOne({
        where: {
          id: random(1, count - 1),
        },
      });
    } while (word === null);
    res.json({ status: 1, data: word });
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

module.exports = router;
