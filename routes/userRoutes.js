const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// Registrace
router.get('/register', (req, res) => res.render('register'));
router.post('/register', usersController.register);

// Přihlášení
router.get('/login', (req, res) => res.render('login'));
router.post('/login', usersController.login);

module.exports = router;