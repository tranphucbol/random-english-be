const fs = require('fs');
const config = require("../config")

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const notString = (str) => {
  return str === undefined || str === null || typeof(str) !== "string" ||  str === "";
}

const storeImage = (name, data) => {
  if(!fs.existsSync(config.imageDir)) {
    fs.mkdirSync(config.imageDir)
  }
  fs.writeFileSync(`${config.imageDir}/${name}`, data, 'base64');
}

module.exports = { sleep, random, storeImage, notString };
