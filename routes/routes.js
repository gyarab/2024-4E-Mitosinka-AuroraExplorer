const express = require('express');
const router = express.Router(); 
const path = require('path');
const usersController = require('../controllers/usersController');



router.post("/login", usersController.login);
router.post('/register', usersController.register);

router.get("/user-profile", usersController.userProfile);

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