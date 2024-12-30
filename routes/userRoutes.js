const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const upload = require('../middleware/upload');
const Post = require('../models/Post');
const User = require('../models/User');
require('dotenv').config();

router.post("/login", usersController.login);
router.post('/register', usersController.register);
router.post('/edit-profile', upload.single('profilePicture'), usersController.updateProfile);
router.post('/change-password', usersController.changePassword);
router.post('/update-location', usersController.updateLocation);

router.get('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.redirect('/');
});

router.get('/login', (req, res) => {
  res.render('users/login');
});

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.get('/profile', async (req, res) => {
  if (req.user) {
    try {
      const userPosts = await Post.find({ userId: req.user.id })
        .populate('userId', 'userName profilePicture')
        .populate('comments.userId', 'userName profilePicture')
        .sort({ timestamp: -1 });

      const fullUserDetails = await User.findById(req.user.id);
      
      res.render('users/profile', { 
        user: fullUserDetails, 
        userPosts,
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY 
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
      res.status(500).send('Error loading profile');
    }
  } else {
    res.render('users/login');
  }
});

router.get('/edit-profile', (req, res) => {
  if (req.user) {
    res.render('users/edit-profile', { user: req.user });
  } else {
    res.render('users/login');
  }
});

module.exports = router;