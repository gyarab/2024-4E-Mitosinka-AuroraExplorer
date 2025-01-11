require('dotenv').config();
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const upload = require('../middleware/upload');
const { createPost, addComment, toggleLike } = require('../controllers/postController');


router.get('/', async (req, res) => {
  if (req.user) {
    try {
      // fetch all posts, populate user and comments data, and sort by time from newest
      const posts = await Post.find()
        .populate('userId', 'userName profilePicture')
        .populate('comments.userId', 'userName profilePicture')
        .sort({ timestamp: -1 });
      //render homepage with posts and google API KEY for showing location
      res.render('aurorex/index', { posts, GOOGLE_API_KEY: process.env.GOOGLE_API_KEY });
    } catch (error) {
      res.status(500).send('Error fetching posts: ' + error.message);
    }
  } else {
    res.render('users/login')
  }
});





router.get('/post', (req, res) => {
  if (req.user) {
    res.render('aurorex/post', { GOOGLE_API_KEY: process.env.GOOGLE_API_KEY });
  } else {
    res.render('users/login')
  }
});



router.delete('/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    // find the post by ID and delete it
    const result = await Post.findByIdAndDelete(postId);

    if (result) {
      return res.status(200).json({ message: 'Post deleted successfully' });
    } else {
      return res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ message: 'Error deleting post' });
  }
});





router.delete('/:postId/comment/:commentId/delete', async (req, res) => {
  try {
    //find post by ID
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // find comment by ID in the post
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    //check if usere is authorized to delete comment (owner of post or owner of comment)
    if (comment.userId.toString() !== req.user.id && post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    //remove comment and save post
    post.comments.pull({ _id: req.params.commentId });
    await post.save();
    res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/live-map', (req, res) => {
  if (!req.user) return res.render('users/login');
  res.render('aurorex/live-map', { GOOGLE_API_KEY: process.env.GOOGLE_API_KEY });
});

router.get('/api/today-posts', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    //find post created from today onwards, populate user data
    const posts = await Post.find({
      timestamp: { $gte: today }
    })
      .populate('userId', 'userName profilePicture')
      //sort in descending order
      .sort({ timestamp: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


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