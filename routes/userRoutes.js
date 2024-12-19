const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.post("/login", usersController.login);
router.post('/register', usersController.register);
router.post('/edit-profile', usersController.updateProfile);
router.post('/change-password', usersController.changePassword);

router.get('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.redirect('/');
});

router.get('/login', (req, res) => {
  res.render('users/login');
});
router.get('/register', (req, res) => {
  res.render('users/register');
})
router.get('/profile', (req, res) => {
  res.render('users/profile');
})
router.get('/edit-profile', (req, res) => {
  res.render('users/edit-profile', { user: req.user });
});



module.exports = router;