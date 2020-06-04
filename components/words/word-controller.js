const express = require("express");
const router = express.Router();
const userVerifyToken = require("../users/user-verify-token");
const Word = require("./words");
const LearnedWord = require("./learned-words");
const { random } = require("../../utils");

router.post("/random", async (req, res) => {
  try {
    const words = await Word.findAll();
    const min = 0;
    const max = words.length - 1;
    let randomIndex = random(min, max);

    const word = words[randomIndex];
    res.json({
      status: 1,
      data: {
        wordId: word.id,
        question: word.vie,
        answer: word.eng,
        wrongAnswers: word.answers,
        examples: word.examples
      }
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

router.post("/get/:wordId", userVerifyToken, async (req, res) => {
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

router.post("/random-question", userVerifyToken, async (req, res) => {
  const { userId } = req.user;
  try {
    const learnedWord = await LearnedWord.findAll({
      where: {
        userId,
      },
    });
  
    if(learnedWord.length > 0) {
      const min = 0;
      const max = learnedWord.length - 1;
      let word = null;
    
      while(word === null) {
        let randomIndex = random(min, max);
        word = await Word.findOne({where: {
          id: learnedWord[randomIndex].wordId
        }});
      }
  
      res.json({
        status: 1,
        data: {
          wordId: word.id,
          question: word.vie,
          answer: word.eng,
          wrongAnswers: word.answers,
          examples: word.examples
        }
      })
    } else {
      res.status(400).json({
        status: 0,
        message: "You have not learned any words yet"
      })
    }
    
  } catch (err) {
    console.error(err);
    res.status(400).json({status: 0, message: "Something went wrong"});
  }
});

module.exports = router;
