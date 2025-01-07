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

router.get('/profile/:userId', async (req, res) => {
  if (!req.user) return res.redirect('/users/login');
  
  try {
    let profileUser = await User.findById(req.params.userId);
    if (!profileUser) return res.status(404).send('User not found');

    const userPosts = await Post.find({ userId: req.params.userId })
      .populate('userId', 'userName profilePicture')
      .populate('comments.userId', 'userName profilePicture')
      .sort({ timestamp: -1 });
    //checking if the profileUser is same as logged in, so i can manage profile.ejs
    if(profileUser._id.toString() === req.user._id.toString()){
      profileUser = null;
    }

    // passing both req.user as well as user we want to look at
    res.render('users/profile', { 
      user: req.user, // This is the loggedin user from attachUser middleware
      profileUser: profileUser, // This is the user we are viewing right now
      userPosts: userPosts,
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error fetching profile: ' + error.message);
  }
});

router.get('/edit-profile', (req, res) => {
  if (req.user) {
    res.render('users/edit-profile', { user: req.user });
  } else {
    res.render('users/login');
  }
});

router.post('/toggle-notifications', async (req, res) => {
  try {
      const user = await User.findById(req.user.id);
      user.notificationsEnabled = !user.notificationsEnabled;
      await user.save();
      
      res.json({
          success: true,
          enabled: user.notificationsEnabled,
          message: `Notifications ${user.notificationsEnabled ? 'enabled' : 'disabled'} successfully!`
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: 'Error updating notification settings'
      });
  }
})

module.exports = router;