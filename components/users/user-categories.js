const { Sequelize, DataTypes, Model } = require("sequelize");
const config = require("../../config");
const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  config.db
);

class UserCategory extends Model {}

UserCategory.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    sequelize,
    modelName: "user_categories",
    charset: "utf8",
    collate: "utf8_general_ci",
  }
);

module.exports = UserCategory;
