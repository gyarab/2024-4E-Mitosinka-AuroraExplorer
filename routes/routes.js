const express = require('express');
const router = express.Router(); 
const path = require('path');
const userController = require('../controllers/usersController');



router.post("/login", userController.login);

router.get("/user-profile", userController.userProfile);

router.get('/', (req, res) => {
    res.render('index'); 
  })
  router.get('/register', (req, res) =>{
    res.render('register')
  })
  
  router.get('/forecast', (req, res) => {
    res.render('forecast');
  });
  
  router.get('/gallery', (req, res) => {
    res.render('gallery'); 
  });
  
  router.get('/login', (req, res) => {
    res.render('login');  
  });
  
  router.get('/*', (req, res) => {
    res.status(404).render('404');
  });
  

module.exports = router;