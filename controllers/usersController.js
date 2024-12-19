const bcrypt = require('bcrypt')
const User = require("../models/User")
const jwt = require("jsonwebtoken")

exports.register = async (req, res) => {
    try {
      const { userName, email, password } = req.body;
  

      const saltRounds = 10; 
      const hashedPassword = bcrypt.hashSync(password, saltRounds);
      console.log(userName, email, password)

      const newUser = new User({ userName, email, password: hashedPassword });
      await newUser.save();
  
      res.redirect('users/login');
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
      console.log(email, password);

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

exports.userProfile = (req, res, next) => {
    return res.status(200).json({message: "Authorized User"});
};