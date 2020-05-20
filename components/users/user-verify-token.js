const jwt = require("jsonwebtoken");
const config = require("../../config");

const verifyToken = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(400).json({
            status: 0,
            message: "Token is not valid",
        });
    }
    const token = req.headers.authorization.split(" ")[1];
    if (token) {
        try {
            const user = await jwt.verify(token, config.tokenSecret);
            req.user = {email: user.email, name: user.name}
            next();
        } catch (err) {
            console.log(err);
            return res.status(400).json({
                status: 0,
                message: "Token is not valid",
            });
        }
    } else {
        return res
            .status(400)
            .json({ status: 0, message: "Token is not valid" });
    }
};
module.exports = verifyToken;
