const express = require("express");
const router = express.Router();
const Category = require("./categories");
const UserCategory = require("../users/user-categories");
const User = require("../../components/users/users");
const Word = require("../../components/words/words");
const LearnedWord = require("../../components/words/learned-words");
const userVerifyToken = require("../users/user-verify-token");

router.post("/create", userVerifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    const { userId } = req.user;
    const createdCategory = await Category.create({ name, userId });
    await UserCategory.create({ userId, categoryId: createdCategory.id });
    res.status(200).json({ status: 1, data: createdCategory.get() });
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

router.post("/get-public", async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { public: true },
      attributes: ["id", "name"],
      include: [{ model: User, attributes: ["id", "email", "name"] }],
    });
    res.json({ status: 1, data: categories });
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

router.post("/get-private", userVerifyToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findOne({
      where: { id: userId },
      attributes: [],
      include: [
        {
          model: Category,
          attributes: ["id", "name", "public"],
          include: [
            { model: User, attributes: ["id", "name", "email"] },
            { model: Word, attributes: ["id"] },
            { model: LearnedWord, attributes: ["wordId"] },
          ],
        },
      ],
    });

    const categories = user.categories.map((category) => ({
      id: category.id,
      name: category.name,
      user: category.user,
      wordCount: category.words.length,
      learnedWordCount: category.learned_words.length,
      public: category.public,
    }));

    res.json({ status: 1, data: categories });
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

router.post("/get-all-words", userVerifyToken, async (req, res) => {
  try {
    const { userId } = req.user;
    let { categoryId } = req.body;

    const user = await User.findOne({
      where: { id: userId },
      include: [
        {
          model: Category,
          where: { id: categoryId },
          include: [{ model: Word }],
        },
      ],
    });

    const category =
      user.categories.length > 0 ? user.categories[0].get() : null;
    if (category === null) {
      res.status(400).json({ status: 0, message: "Category not found" });
    } else {
      res.json({ status: 1, data: category });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

module.exports = router;
