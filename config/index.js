let dotenv = require("dotenv");

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = dotenv.config();

if (!envFound) {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

module.exports = {
  port: parseInt(process.env.PORT) || 3001,
  db: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  },
  tokenLife: parseInt(process.env.TOKEN_LIFE),
  tokenSecret: process.env.TOKEN_SECRET,
  api: {
    prefix: "/api",
  },
  imageDir: process.env.IMAGE_DIR,
  imageUrl: process.env.IMAGE_URL,
  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  },
  tokenMailSecret: process.env.TOKEN_MAIL_SECRET,
  tokenMailLife: parseInt(process.env.TOKEN_MAIL_LIFE),
  host: process.env.HOST,
};
