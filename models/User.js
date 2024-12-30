const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, required: false},
    profilePicture: { type: String, default: '/uploads/default-profile-picture.jpg' },
    location: { latitude: Number, longitude: Number},
    alertRadius: {type: Number, default: 50 }
});

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString(),
        delete returnedObject._id;
        delete returnedObject._v;
        delete returnedObject.password;

    },
});

const User = mongoose.model('User', userSchema);
module.exports = User;

