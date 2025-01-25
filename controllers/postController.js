const Post = require('../models/Post');
const notificationService = require('../services/notificationService.js');

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
