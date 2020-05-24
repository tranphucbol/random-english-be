const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

module.exports = { sleep, random };
