const mongoose = require('mongoose');

//schema for user
const userSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, required: false },
    profilePicture: { type: String, default: '/uploads/default-profile-picture.jpg' },
    location: { latitude: Number, longitude: Number },
    alertRadius: { type: Number, default: 50 },
    notificationsEnabled: { type: Boolean, default: true },
    notificationsForHighKp: {type: Boolean, default: true}
});

module.exports = mongoose.model('User', userSchema);


