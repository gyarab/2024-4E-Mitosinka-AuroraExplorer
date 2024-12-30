require('dotenv').config();
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const upload = require('../middleware/upload');
const { addComment, toggleLike } = require('../controllers/postController');

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
  .populate('userId', 'userName profilePicture')
  .populate('comments.userId', 'userName profilePicture')
  .sort({ timestamp: -1 });
    res.render('aurorex/index', { posts, GOOGLE_API_KEY: process.env.GOOGLE_API_KEY });
  } catch (error) {
    res.status(500).send('Error fetching posts: ' + error.message);
  }
});

router.get('/post', (req, res) => {
  if(req.user){
    res.render('aurorex/post', {GOOGLE_API_KEY: process.env.GOOGLE_API_KEY});
  }else{
    res.render('users/login')
  }
});

router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { latitude, longitude, description } = req.body;
    const imageUrl = '/uploads/' + req.file.filename;
    const userId = req.user.id;

    const post = new Post({
      imageUrl,
      location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      userId,
      description
    });

    await post.save();
    res.redirect('/aurorex');
  } catch (error) {
    res.status(500).send('Error creating post: ' + error.message);
  }
});

router.post('/:id/comment', async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;
    await addComment(req.params.id, userId, text);
    res.redirect('/aurorex');
  } catch (error) {
    res.status(500).send('Error adding comment: ' + error.message);
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    const userId = req.user.id;
    await toggleLike(req.params.id, userId);
    res.redirect('/aurorex');
  } catch (error) {
    res.status(500).send('Error liking post: ' + error.message);
  }
});

module.exports = router;