require('dotenv').config();
const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

function authenticateToken(req, res, next){
    const authheader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1];

    if(token == null) return res.sendStatus(401);
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user)=>{
        if(err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

function generateAccessToken(username){
    return jwt.sign({data: username}, ACCESS_TOKEN_SECRET, {
        expiresIn: "1h"
    });
}
module.exports = authenticateToken;
module.exports = generateAccessToken;
