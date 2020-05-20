const jwt = require("jsonwebtoken");
const config = require("../config.js");

const verifyToken = async (req, res, next) => {
    if(!req.headers.authorization) {
        return res.status(400).json({
            message: "Token is not valid"
        });
    }
    const token = req.headers.authorization.split(' ')[1];
    if (token) {
        try {
            const user = await jwt.verify(token, config.secret);
            
        } catch (err) {
            console.log(err);
            return res.status(400).json({
                message: "Token is not valid"
            });
        }
    } else {
        return res.status(400).json({
            message: "Token is not valid"
        });
    }
};
module.exports = { verifyToken };