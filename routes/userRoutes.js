const express = require('express');
const router = express.Router(); 
const usersController = require('../controllers/usersController');

router.post("/login", usersController.login);
router.post('/register', usersController.register);


router.get('/login', (req, res) => {
    console.log("login route dawdaw")
    res.render('users/login');  
  });
  router.get('/register', (req, res) =>{
    res.render('users/register')
  })


router.get("/user-profile", usersController.userProfile);

module.exports = router;