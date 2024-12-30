const jwt = require('jsonwebtoken');

const User = require('../models/User'); 

const attachUser = async (req, res, next) => {

  const token = req.cookies.authToken;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id); 

    if (!user) {
      req.user = null; 
    } else {
      req.user = user; 
    }

  } catch (err) {
    console.error('Token verification failed:', err.message);
    req.user = null; 
  }

  next();

};


module.exports = attachUser;