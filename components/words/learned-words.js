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
  },
  {
    timestamps: false,
    sequelize,
    modelName: "learned_words",
    charset: "utf8",
    collate: "utf8_general_ci",
  }
);

(async () => {
  await LearnedWord.sync();
})();

module.exports = LearnedWord;
