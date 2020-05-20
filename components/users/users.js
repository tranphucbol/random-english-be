const { Sequelize, DataTypes, Model } = require('sequelize');
const config = require("../../config")
const sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, config.db);

class User extends Model {}

User.init({
  // Model attributes are defined here
  email: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING
  },
  numberPhone: {
    type: DataTypes.STRING
  }
}, {
  timestamps: false,
  sequelize,
  modelName: 'users'
});

(async () => {
    await User.sync();
})()

module.exports = User;