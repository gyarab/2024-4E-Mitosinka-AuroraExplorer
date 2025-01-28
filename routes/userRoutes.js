const express = require('express');
const router = express.Router();
const {login, register, updateProfile, changePassword, updateLocation, getProfile, toggleNotifications, toggleKpNotifications} = require('../controllers/usersController');
const upload = require('../middleware/upload');
const Post = require('../models/Post');
const User = require('../models/User');
require('dotenv').config();

//post route for logging in
router.post("/login", login);

//post route for registering
router.post('/register', register);

//post route for updated profile
router.post('/edit-profile', upload.single('profilePicture'), updateProfile);

//post route for changed password
router.post('/change-password', changePassword);

//post route for updated location
router.post('/update-location', updateLocation);

//route for logging out
router.get('/logout', (req, res) => {
  res.clearCookie('authToken'); //clear cookies
  res.redirect('/');
});

//route for getting login page
router.get('/login', (req, res) => {
  res.render('users/login');
});

//route for getting register page
router.get('/register', (req, res) => {
  res.render('users/register');
});

//route for getting user profile
router.get('/profile/:userId', getProfile);

router.get('/edit-profile', (req, res) => {
  if (req.user) {
    res.render('users/edit-profile', { user: req.user }); //render edit-profile if user logged in
  } else {
    res.render('users/login'); //if not logged in, render login
  }
});

//route for enabling notifications for posts in user selected area
router.post('/toggle-notifications', toggleNotifications);

//route for enabling notifications for high KP activity
router.post('/toggle-kp-notifications', toggleKpNotifications);

//render 404.ejs page for all unknown routes
router.get('*/', (req, res) => {
  res.status(404).render('404');
});

module.exports = router;