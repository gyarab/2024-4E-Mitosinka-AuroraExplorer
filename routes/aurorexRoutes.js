require('dotenv').config();
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const upload = require('../middleware/upload');
const { createPost, addComment, toggleLike, getPosts, deletePost, deleteComment, timeMapFilter } = require('../controllers/postController');


//route for showing posts page 
router.get('/', async (req, res) => {
  if (!req.user) return res.render('users/login');
  res.render('aurorex/index', {
    posts: [], // initial empty array, posts will be loaded via API (/api/posts)
    user: req.user,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
  });
});

//route for loading posts on posts page
router.get('/api/posts', getPosts);


//route for creating post
router.get('/post', (req, res) => {
  if (req.user) {
    res.render('aurorex/post', { GOOGLE_API_KEY: process.env.GOOGLE_API_KEY });
  } else {
    res.render('users/login')
  }
});

//route for deleting post
router.delete('/:id', deletePost);


//route for deleting comment
router.delete('/:postId/comment/:commentId/delete', deleteComment);


//route for showing live map
router.get('/live-map', (req, res) => {
  if (!req.user) return res.render('users/login');
  res.render('aurorex/live-map', { GOOGLE_API_KEY: process.env.GOOGLE_API_KEY });
});



//filter posts on live map by time frame
router.get('/api/posts-by-time', timeMapFilter);


//hangle adding new post with image
router.post('/add', upload.single('image'), createPost);


//route for adding comments
router.post('/:id/comment', async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;
    //call addComment from postController.js
    await addComment(req.params.id, userId, text);
    res.redirect('/aurorex');
  } catch (error) {
    res.status(500).send('Error adding comment: ' + error.message);
  }
});





//route for adding like
router.post('/:id/like', async (req, res) => {
  try {
    const userId = req.user.id;
    //use toggleLike function from postController.js
    await toggleLike(req.params.id, userId);
    res.redirect('/aurorex');
  } catch (error) {
    res.status(500).send('Error liking post: ' + error.message);
  }
});





//route for handling unknown routes (show 404.ejs page)
router.get('*/', (req, res) => {
  res.status(404).render('404');
});

module.exports = router;