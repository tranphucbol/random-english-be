const { Sequelize, DataTypes, Model } = require("sequelize");
const config = require("../../config");
const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  config.db
);

class Category extends Model {}

Category.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    public: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0
    }
  },
  {
    timestamps: false,
    sequelize,
    modelName: "categories",
    charset: "utf8",
    collate: "utf8_general_ci",
  }
);

module.exports = Category;
