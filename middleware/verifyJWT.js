const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token) return res.redirect('/login');
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.redirect('/login');
      req.user = decoded; 
      next();
    });
  };
  
module.exports = verifyJWT