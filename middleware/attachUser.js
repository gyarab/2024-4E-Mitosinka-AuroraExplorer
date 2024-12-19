const jwt = require('jsonwebtoken');

const attachUser = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      req.user = null;
    } else {
      req.user = user;
      console.log(user)
    }
    next();
  });
};

module.exports = attachUser;
