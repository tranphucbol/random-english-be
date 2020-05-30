const express = require("express");
const router = express.Router();
const userVerifyToken = require("../users/user-verify-token");
const Word = require("./words");
const LearnedWord = require("./learned-words");
const { random } = require("../../utils");

router.post("/random", async (req, res) => {
  try {
    const { userId } = req.user;
    const count = await Word.count();
    let word;
    do {
      word = await Word.findOne({
        where: {
          id: random(1, count - 1),
        },
      });
    } while (word === null);

    let learnedWord = await LearnedWord.findOne({
      where: {
        userId,
        wordId: word.id,
      },
    });
    res.json({
      status: 1,
      data: { ...word.get(), learned: learnedWord !== null },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

router.post("/get/:wordId", async (req, res) => {
  try {
    let { wordId } = req.params;
    let { userId } = req.user;
    let word = await Word.findOne({ where: { id: wordId } });
    if (word === null) {
      res.status(400).json({ status: 0, message: "Word not found" });
    } else {
      let learnedWord = await LearnedWord.findOne({
        where: {
          userId,
          wordId,
        },
      });
      res.json({
        status: 1,
        data: { ...word.get(), learned: learnedWord !== null },
      });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

router.post("/learn/:wordId", userVerifyToken, async (req, res) => {
  try {
    let { userId } = req.user;
    let { wordId } = req.params;
    let word = await Word.findOne({
      where: {
        id: wordId,
      },
    });
    if (word !== null) {
      await LearnedWord.create({ userId, wordId });
      res.json({ status: 1, message: "learned" });
    } else {
      res
        .status(400)
        .json({ status: 0, message: `Word ID:  ${wordId} does not exist` });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

router.post("/forget/:wordId", userVerifyToken, async (req, res) => {
  try {
    const { wordId } = req.params;
    const { userId } = req.user;
    await LearnedWord.destroy({ where: { userId, wordId } });
    res.json({ status: 1, message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

module.exports = router;
