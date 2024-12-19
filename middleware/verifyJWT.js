const jwt = require('jsonwebtoken');

/*const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(!authHeader?.startWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if(err) return res.sendStatus(403);
            req.user = user
            console.log(token);
            next();
        }
    );
}*/



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