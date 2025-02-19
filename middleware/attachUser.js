const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

//attaching user from cookie to object
const attachUser = async (req, res, next) => {
const token = req.cookies.authToken; //get jwt from cookies
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); //verify the token using secret token
    const user = await User.findById(decoded.id); 
    if (!user) {
      req.user = null; 
    } else {
      //if user found, attach it to object user
      req.user = user; 
    }
  } catch (err) {
    console.error('Token verification failed:', err.message);
    req.user = null; 
  }
  next();
};


module.exports = attachUser;