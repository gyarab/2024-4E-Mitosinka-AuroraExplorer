require('dotenv').config();
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const upload = require('../middleware/upload');
const { createPost, addComment, toggleLike } = require('../controllers/postController');


router.get('/', async (req, res) => {
  if (!req.user) return res.render('users/login');
  res.render('aurorex/index', {
    posts: [], // initial empty array, posts will be loaded via API (/api/posts)
    user: req.user,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
  });
});





router.get('/api/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; //current page number, default 1
    const limit = parseInt(req.query.limit) || 6; //post limit per page, default 6
    const filter = req.query.filter || 'newest'; //sorting, default sort by newest
    const skip = (page - 1) * limit; //calculate how many posts to skip based on current page

    // create aggregation pipeline for proper sorting
    const aggregationPipeline = [
      // join posts collec. with users collec.
      {
        $lookup: {
          from: 'users', //collec. to join with
          localField: 'userId', //userId in posts collection to match
          foreignField: '_id', //match with _id in users collection
          as: 'userInfo' //store user info in userInfo arr
        }
      },
      //convert userInfo array to a single object
      {
        $unwind: '$userInfo'
      },
      // add calculated fields
      {
        $addFields: {
          //calculates number of likes/comments for each post
          likesCount: { $size: '$likes' },
          commentsCount: { $size: '$comments' }
        }
      }
    ];
    // add sorting based on filter
    let sort = {};
    switch (filter) {
      case 'mostLikes':
        sort = { $sort: { likesCount: -1, timestamp: -1 } };
        break;
      case 'mostComments':
        sort = { $sort: { commentsCount: -1, timestamp: -1 } };
        break;
      case 'newest':
      default:
        sort = { $sort: { timestamp: -1 } };
        break;
    }
    //add sorting stage to aggregation pipeline before pagination so the posts are all sorted, just not displayed 
    aggregationPipeline.push(sort);

    // add pagination
    aggregationPipeline.push(
      { $skip: skip }, //skip posts from previous page
      { $limit: limit } //limit of posts per page
    );

    // execute aggregation pipeline
    const posts = await Post.aggregate(aggregationPipeline);

    // populate comments user info
    await Post.populate(posts, {
      path: 'comments.userId',
      select: 'userName profilePicture' //select only necessary fields for comments
    });

    // get total posts count
    const totalPosts = await Post.countDocuments();

    // check if there are more posts to load
    const hasMore = skip + posts.length < totalPosts;

    // format the posts to match frontend structure
    const formattedPosts = posts.map(post => ({
      ...post, // spread all original post properties
      userId: { //restructure userId to match frontend format
        _id: post.userInfo._id,
        userName: post.userInfo.userName,
        profilePicture: post.userInfo.profilePicture
      }
    }));

    //send formatted posts and pagination info as json
    res.json({ posts: formattedPosts, hasMore });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
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




router.get('/api/posts-by-time', async (req, res) => {
  try {
    const timeRange = req.query.range || 'day'; // default to day
    const now = new Date();
    let startDate;

    // calculate start date based on time range
    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); //now -24h
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);//now - 7days
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); //now - 30 days
        break;
      default:
        return res.status(400).json({ error: 'Invalid time range' });
    }

    // find posts within the specified time range
    const posts = await Post.find({
      timestamp: { $gte: startDate }
    })
      .populate('userId', 'userName profilePicture')
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