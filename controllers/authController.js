const jwt = require("jsonwebtoken");
require('dotenv').config()

exports.auth = async (req, res) => {
    try {
        const username = req.body.userName
        const user = {name: username}

        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
        res.json({accessToken: accessToken})
        console.log('123');
    }catch{

    }
};
