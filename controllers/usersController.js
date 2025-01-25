const bcrypt = require('bcrypt')
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const path = require('path');


exports.register = async (req, res) => {
  try {
    const { email, password, userName } = req.body;

    // check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        //error message to display if email exists already
        message: "Email is already registered. Please use a different email address."
      });
    }

    // create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, userName });

    await user.save();

    res.status(201).json({ message: "Registration successful" });

  } catch (error) {
    res.status(500).json({ message: "Error during registration: " + error.message });
  }
};





exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    //create JWT with user detail and sign it
    const accessToken = jwt.sign(
      { id: user._id, userName: user.userName, email: user.email },
      process.env.ACCESS_TOKEN_SECRET, //secret key for signing token
      { expiresIn: '1h' }
    );
    //set JWT as a cookie named authToken
    res.cookie('authToken', accessToken, { httpOnly: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).send('Error logging in: ' + error.message);
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, alertRadius } = req.body;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      location: { latitude, longitude },
      alertRadius
    });

    res.status(200).json({ message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating location' });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userName, email } = req.body;
    let updateData = { userName, email };

    //check if profile picture was uploaded
    if (req.file) {
      const profilePicturePath = path.join('/uploads', req.file.filename);
      updateData.profilePicture = profilePicturePath;
    }

    await User.findByIdAndUpdate(userId, updateData);

    // update jwt with new user data and signing it again with secret key
    const accessToken = jwt.sign(
      { id: userId, userName, email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    res.cookie('authToken', accessToken, { httpOnly: true });

    res.redirect('/users/profile/' + userId);
  } catch (error) {
    res.status(500).send('Error updating profile: ' + error.message);
  }
};




exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {

    const user = await User.findById(req.user.id);
    //check if pswd is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).send('Current password is incorrect.');
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).send('New passwords do not match.');
    }
    //hash new password and save to db
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();


    res.redirect('/users/profile/' + req.user.id);
  } catch (error) {
    res.status(500).send('Error changing password: ' + error.message);
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const userId = req.user.id;
    const filePath = `/uploads/${req.file.filename}`;
    //find user and update profile picture
    await User.findByIdAndUpdate(userId, { profilePicture: filePath });

    res.redirect('/users/profile/' + userId);
  } catch (error) {
    res.status(500).send('Error uploading profile picture: ' + error.message);
  }
};