const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/forecast', (req, res) => {
  res.render('forecast');
});

router.get('/guide', (req, res) => {
  res.render('guide');
});

router.get(/^(?!\/(users|aurorex)).*/, (req, res) => {
  res.status(404).render('404');
});


module.exports = router;