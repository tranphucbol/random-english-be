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

router.post("/get-public", userVerifyToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const categories = await Category.findAll({
      where: { public: true },
      attributes: ["id", "name"],
      include: [{ model: User, attributes: ["id", "email", "name"] }],
    });

    const myCategories = await UserCategory.findAll({
      where: {
        userId,
      },
      attributes: ["categoryId"],
    }).map((category) => category.categoryId);

    res.json({
      status: 1,
      data: categories.filter(
        (category) => !myCategories.includes(category.id)
      ),
    });
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
          ],
        },
      ],
    });

    // console.log(user.categories.map(category => category.get()));
    // console.log(user.categories.map((category) =>category.learned_words.map(word => word.get())))

    const learnedWordCounts = await Promise.all(
      user.categories.map((category) =>
        LearnedWord.count({ where: { userId, categoryId: category.id } })
      )
    );

    const categories = user.categories.map((category, index) => ({
      id: category.id,
      name: category.name,
      user: category.user,
      wordCount: category.words.length,
      learnedWordCount: learnedWordCounts[index],
      isPublic: category.public,
      allowChangePrivacy: category.user.id === userId,
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
          include: [
            { model: User, attributes: ["id", "name", "email"] },
            { model: Word },
            { model: LearnedWord, attributes: ["wordId"] },
          ],
        },
      ],
    });

    const category =
      user.categories.length > 0 ? user.categories[0].get() : null;
    if (category === null) {
      res.status(400).json({ status: 0, message: "Category not found" });
    } else {

      const learnedWords = await LearnedWord.findAll({
        where: { userId, categoryId },
      });

      const words = category.words.map((word) => ({
        ...word.get(),
        learned: learnedWords.includes(word.id),
      }));
      const data = {
        id: category.id,
        name: category.name,
        user: category.user,
        words,
        isPublic: category.public,
      };
      res.json({ status: 1, data: data });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 0, message: "Something went wrong" });
  }
});

router.post(
  "/add-to-my-categories/:categoryId",
  userVerifyToken,
  async (req, res) => {
    try {
      const { userId } = req.user;
      const { categoryId } = req.params;

      await UserCategory.create({ userId, categoryId });
      res.json({ status: 1, message: "Add category successfully" });
    } catch (err) {
      console.error(err);
      res.status(400).res({ status: 0, message: "Something went wrong" });
    }
  }
);

router.post(
  "/remove-to-my-categories/:categoryId",
  userVerifyToken,
  async (req, res) => {
    try {
      const { userId } = req.user;
      const { categoryId } = req.params;

      const userCategory = await UserCategory.findOne({
        where: { userId, categoryId },
      });
      if (userCategory === null) {
        res.json({
          status: 0,
          message: "Category not found or Category dose not belongs to you",
        });
      } else {
        userCategory.destroy();
        res.json({ status: 1, message: "Deleted category successfully" });
      }
    } catch (err) {
      console.error(err);
      res.json({ status: 0, message: "Something went wrong" });
    }
  }
);

router.post(
  "/change-privacy/:categoryId",
  userVerifyToken,
  async (req, res) => {
    {
      try {
        const { categoryId } = req.params;
        const { userId } = req.user;
        const category = await Category.findOne({ where: { id: categoryId } });
        if (category === null) {
          res.status(400).json({ status: 0, message: "Category not found" });
        } else {
          if (category.userId === userId) {
            category.public = !category.public;
            await category.save();
            res.json({ status: 1, message: "Changed privacy successfully" });
          } else {
            res
              .status(400)
              .json({ status: 0, message: "Category does not belongs to you" });
          }
        }
      } catch (err) {
        console.error(err);
        res.json({ status: 0, message: "Something went wrong" });
      }
    }
  }
);

module.exports = router;
