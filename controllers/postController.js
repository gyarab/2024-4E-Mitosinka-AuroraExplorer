const Post = require('../models/Post');

exports.createPost = async (req, res) => {
  try {
    const { imageUrl, latitude, longitude, description } = req.body;
    const userId = req.user.id;

    const post = new Post({
      imageUrl,
      location: { latitude, longitude },
      userId,
      description
    });

    await post.save();
    res.redirect('/aurorex');
  } catch (error) {
    res.status(500).send('Error creating post: ' + error.message);
  }
};


exports.addComment = async (postId, userId, text) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  post.comments.push({ userId, text });
  await post.save();
};


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
