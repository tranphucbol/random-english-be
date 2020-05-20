const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const config = require('./config')

const userController = require('./components/users/user-controller')
const User = require('./components/users/users');

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get('/sync', async (req, res) => {
    await User.sync();
    res.json({"message": "sync!!!"})
})
app.use(`${config.api.prefix}/users`, userController)

app.listen(config.port, () => {
    console.log("server is listening on port " + config.port);
});
