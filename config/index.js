let dotenv = require("dotenv");

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = dotenv.config();

if (!envFound) {
    throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

module.exports = {
    port: parseInt(process.env.PORT) || 3001,
    db: {
        username: "usrunadmin",
        password: "usrunadmin1620",
        database: "random_english",
        host: "128.199.159.72",
        dialect: "mysql"
    },
    tokenLife: parseInt(process.env.TOKEN_LIFE),
    tokenSecret: process.env.TOKEN_SECRET,
    api: {
        prefix: "/api"
    }
};