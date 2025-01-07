const bcrypt = require('bcrypt')
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const path = require('path');


exports.register = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    //hash password
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    console.log(userName, email, password)

    //add user to database
    const newUser = new User({ userName, email, password: hashedPassword });
    await newUser.save();

    res.redirect('/users/login');
  } catch (error) {
    res.status(500).send('Error registering user: ' + error.message);
  }
};





exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid email or password');
    }
    console.log(email, password, user._id);

    const accessToken = jwt.sign(
      { id: user._id, userName: user.userName, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    console.log(accessToken + " " + user._id + " " + user.userName);

    res.cookie('authToken', accessToken, { httpOnly: true });
    res.redirect('/');
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

    
    if (req.file) {
      const profilePicturePath = path.join('/uploads', req.file.filename);
      updateData.profilePicture = profilePicturePath;
    }

    await User.findByIdAndUpdate(userId, updateData);

    // update jwt
    const accessToken = jwt.sign(
      { id: userId, userName, email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    res.cookie('authToken', accessToken, { httpOnly: true });

    res.redirect('/users/profile/'+userId);
  } catch (error) {
    res.status(500).send('Error updating profile: ' + error.message);
  }
};




exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).send('Current password is incorrect.');
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).send('New passwords do not match.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();


    res.redirect('/users/profile/'+userId); 
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

      await User.findByIdAndUpdate(userId, { profilePicture: filePath });

      res.redirect('/users/profile/'+userId);
  } catch (error) {
      res.status(500).send('Error uploading profile picture: ' + error.message);
  }
};