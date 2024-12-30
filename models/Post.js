const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  imageUrl: {type: String, required: true,},
  location: {latitude: { type: Number, required: true }, longitude: { type: Number, required: true },},
  timestamp: {type: Date, default: Date.now,},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,},
  description: {type: String, default: '',},
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  likes: [
    {userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },},
  ],
});

module.exports = mongoose.model('Post', postSchema);
