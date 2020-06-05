const express = require("express");
const router = express.Router();
const userVerifyToken = require("../users/user-verify-token");
const Word = require("./words");
const User = require("../users/users");
const Category = require("../categories/categories");
const LearnedWord = require("./learned-words");
const { random, storeImage, notString } = require("../../utils");
const config = require("../../config");

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
        examples: word.examples,
        categoryId: word.categoryId,
      },
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
      await LearnedWord.create({ userId, wordId, categoryId: word.categoryId });
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

    if (learnedWord.length > 0) {
      const min = 0;
      const max = learnedWord.length - 1;
      let word = null;

      while (word === null) {
        let randomIndex = random(min, max);
        word = await Word.findOne({
          where: {
            id: learnedWord[randomIndex].wordId,
          },
        });
      }

      res.json({
        status: 1,
        data: {
          wordId: word.id,
          question: word.vie,
          answer: word.eng,
          wrongAnswers: word.answers,
          examples: word.examples,
        },
      });
    } else {
      res.status(400).json({
        status: 0,
        message: "You have not learned any words yet",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

router.post("/create", userVerifyToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      concept,
      eng,
      vie,
      examples,
      base64Image,
      answers,
      categoryId,
    } = req.body;

    let image = "";

    if (
      notString(concept) ||
      notString(eng) ||
      notString(vie) ||
      !Number.isInteger(categoryId)
    ) {
      return res.status(400).json({ status: 0, message: "Invalid parameter" });
    }

    const category = await Category.findOne({
      where: { id: categoryId, userId },
    });
    if (category === null) {
      return res
        .status(400)
        .json({ status: 0, message: "Category does not belongs to you" });
    }

    if (!notString(base64Image)) {
      //processing store images
      let extensions = "";
      const parts = base64Image.split(",");
      if (parts.length != 2) {
        return res.json({
          status: 0,
          message: "Base64Image parameter invalid",
        });
      }
      switch (parts[0]) {
        case "data:image/jpeg;base64":
          extensions = "jpeg";
          break;
        case "data:image/png;base64":
          extensions = "png";
          break;
        case "data:image/jpg;base64":
          extensions = "jpg";
          break;
        default:
          return res.status(400).json({
            status: 0,
            message: "Base64Image parameter invalid format",
          });
      }

      const name = `${new Date().getTime()}-${userId}-${categoryId}.${extensions}`;
      image = `${config.imageUrl}/${name}`;
      storeImage(name, parts[1]);
    }

    const word = await Word.create({
      concept,
      eng,
      vie,
      examples: JSON.stringify(examples),
      image,
      answers: JSON.stringify(answers),
      categoryId,
    });
    res.json({ status: 1, data: word.get() });
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

router.post("/delete/:wordId", userVerifyToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { wordId } = req.params;
    if (Number.isInteger(parseInt(wordId))) {
      const word = await Word.findOne({
        where: { id: wordId },
        include: [
          {
            model: Category,
            attributes: ["id"],
            include: [{ model: User, attributes: ["id"] }],
          },
        ],
      });
      if (word !== null && word.category.user.id === userId) {
        await word.destroy();
        res.json({status: 1, message: "Deleted word successfully"})
      } else {
        res
          .status(400)
          .json({
            status: 0,
            message: "Word not found or Word does not belongs to you",
          });
      }
    } else {
      res.status(400).json({ status: 0, message: "Invaild parameter" });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

module.exports = router;
