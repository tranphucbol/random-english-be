const { Sequelize, DataTypes, Model } = require("sequelize");
const config = require("../../config");
const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  config.db
);

class Word extends Model {}

Word.init(
  {
    // Model attributes are defined here
    concept: {
      type: DataTypes.STRING(512),
      allowNull: false,
      
    },
    eng: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
    vie: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
    examples: {
      type: DataTypes.STRING(2048),
      get() {
        return JSON.parse(this.getDataValue('examples'));
      }
    },
    image: {
      type: DataTypes.STRING(512),
    },
    answers: {
      type: DataTypes.STRING(2048),
      get() {
        return JSON.parse(this.getDataValue('answers'));
      }
    },
  },
  {
    timestamps: false,
    sequelize,
    modelName: "words",
    charset: "utf8",
    collate: "utf8_general_ci",
  }
);

(async () => {
  await Word.sync();
})();

module.exports = Word;
