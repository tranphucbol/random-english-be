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
    type: DataTypes.STRING
    // allowNull defaults to true
  }
}, {
  // Other model options go here
  timestamps: false,
  sequelize, // We need to pass the connection instance
  modelName: 'users' // We need to choose the model name
});

(async () => {
    await User.sync();
})()

module.exports = User;