const { Sequelize, DataTypes, Model } = require("sequelize");
const config = require("../../config");
const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  config.db
);

class LearnedWord extends Model {}

LearnedWord.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    wordId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: false,
    sequelize,
    modelName: "learned_words",
    charset: "utf8",
    collate: "utf8_general_ci",
  }
);

module.exports = LearnedWord;
