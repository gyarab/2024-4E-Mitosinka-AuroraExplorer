const Post = require('../models/Post');
const notificationService = require('../services/notificationService.js');

//filtering posts on map by selected time frame
exports.timeMapFilter = async (req, res) => {
  try {
    const timeRange = req.query.range || 'day'; // default to day
    const now = new Date();
    let startDate;

    // calculate start date based on time frame
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

    // find posts within the specified time frame
    const posts = await Post.find({
      timestamp: { $gte: startDate }
    })
      .populate('userId', 'userName profilePicture')
      .sort({ timestamp: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


//delete comment
exports.deleteComment = async (req, res) => {
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
}


//delete post
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    // find the post by ID and delete it
    const result = await Post.findByIdAndDelete(postId);

    if (result) {
      return res.status(200).json({ message: 'Post deleted successfully' });
    } else {
      return res.status(404).json({ message: 'Post not deleted' });
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ message: 'Error deleting post' });
  }
};

//get posts with implemented filter
exports.getPosts = async (req, res) => {
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
      res.status(500).json({ error: 'Error' });
    }
};




//creating post
exports.createPost = async (req, res) => {
  try {
    const { latitude, longitude, description } = req.body;
    const imageUrl = '/uploads/' + req.file.filename;
    const userId = req.user.id;

    // Create and save the post
    const post = new Post({
      imageUrl,
      location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      userId,
      description
    });
    await post.save();

    // Find users in range and send notifications asynchronously
    const usersToNotify = await notificationService.findUsersInRange(
      parseFloat(latitude),
      parseFloat(longitude)
    );

    // Send notifications in the background without blocking the response
    Promise.all(
      usersToNotify
        .filter(user => user.id !== userId) // dont notify the creator
        .map(user =>
          notificationService.sendAuroraAlert(user, {
            description,
            timestamp: new Date()
          }).catch(err => {
            console.error(`Failed to send notification to user ${user.id}:`, err);
            return null; // Continue with other notifications even if one fails
          })
        )
    ).then(results => {
      const sentCount = results.filter(result => result !== null).length;
      console.log(`Sent ${sentCount} notifications for new aurora post`);//log amount of emails sent
    }).catch(err => {
      console.error('Error in notification batch:', err);
    });

    res.redirect('/aurorex');
  } catch (error) {
    res.status(500).send('Error creating post: ' + error.message);
  }
};

//adding comment on post
exports.addComment = async (postId, userId, text) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  post.comments.push({ userId, text });
  await post.save();
};

//toggle like on post
exports.toggleLike = async (postId, userId) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }
  const likeIndex = post.likes.findIndex((like) => like.userId.toString() === userId);
  if (likeIndex > -1) {
    post.likes.splice(likeIndex, 1);
  } else {
    post.likes.push({ userId });
  }

  await post.save();
};
