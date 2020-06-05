const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const config = require("./config");
const User = require('./components/users/users');
const Category = require('./components/categories/categories');
const Word = require('./components/words/words');
const UserCategory = require('./components/users/user-categories');
const LearnedWord = require('./components/words/learned-words');

(async () => {
  await User.sync();
  await Category.sync();
  await Word.sync();
  await UserCategory.sync();
  await LearnedWord.sync();

  await User.hasMany(Category);
  await Category.belongsTo(User);
  
  await User.belongsToMany(Category, {through: UserCategory});
  await Category.belongsToMany(User, {through: UserCategory});

  await Category.hasMany(Word);
  await Word.belongsTo(Category);

  await Category.hasMany(LearnedWord);
})();

const userController = require("./components/users/user-controller");
const wordController = require("./components/words/word-controller");
const categoryController = require("./components/categories/category-controller");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(config.imageUrl, express.static(path.join(__dirname, config.imageDir)));

app.use(`${config.api.prefix}/users`, userController);
app.use(`${config.api.prefix}/words`, wordController);
app.use(`${config.api.prefix}/categories`, categoryController);

app.listen(config.port, () => {
  console.log("server is listening on port " + config.port);
});
