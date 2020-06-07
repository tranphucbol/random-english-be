const fs = require("fs");
const config = require("../config");

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport(config.mail);

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const notString = (str) => {
  return (
    str === undefined || str === null || typeof str !== "string" || str === ""
  );
};

const storeImage = (name, data) => {
  if (!fs.existsSync(config.imageDir)) {
    fs.mkdirSync(config.imageDir);
  }
  fs.writeFileSync(`${config.imageDir}/${name}`, data, "base64");
};

const sendVerifyUserMail = async (email, token) => {
  const link = `http://${config.host}/api/users/verify-mail/${token}`;
  const mailOptions = {
    from: "usrun.hcmus@gmail.com",
    to: email,
    subject: "Random English - Verify your mail ✔",
    text: `Welcome to Random English, Verify your email ✔ - ${link}`,
    html: `Welcome to <b>Random English</b> <br/> <p> Click to <a href="${link}">Verify my email ✔</a></p>`
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sleep, random, storeImage, notString, sendVerifyUserMail };
