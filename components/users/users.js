const { Sequelize, DataTypes, Model } = require("sequelize");
const config = require("../../config");
const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  config.db
);

class User extends Model {}

User.init(
  {
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
    numberPhone: {
      type: DataTypes.STRING,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
  },
  {
    timestamps: false,
    sequelize,
    modelName: "users",
    charset: "utf8",
    collate: "utf8_general_ci",
  }
);

module.exports = User;
