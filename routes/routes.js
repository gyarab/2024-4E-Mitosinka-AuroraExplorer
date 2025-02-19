const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/forecast', (req, res) => {
  res.render('forecast');
});

//route for sending email notifications for high KP activity
router.post('/update-kp-data', async (req, res) => {
  try {
    const { kpData } = req.body;
    console.log('Recieved kp data:', kpData);
    
    const kpNotificationService = require('../services/kpNotificationService');
    await kpNotificationService.checkAndNotifyUsers(kpData);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error handling KP data:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/guide', (req, res) => {
  res.render('guide');
});

router.get(/^(?!\/(users|aurorex)).*/, (req, res) => {
  res.status(404).render('404');
});


module.exports = router;