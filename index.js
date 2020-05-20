const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const config = require('./config')

const userController = require('./components/users/user-controller')

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(`${config.api.prefix}/users`, userController)

app.listen(config.port, () => {
    console.log("server is listening on port " + config.port);
});
