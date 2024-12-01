const bcrypt = require('bcrypt')
const User = require("../models/User")


exports.register = async (req, res) => {
    try {
      const { userName, email, password } = req.body;
  
      // Hash hesla
      const saltRounds = 10; // Use a valid number of salt rounds
      const hashedPassword = bcrypt.hashSync(password, saltRounds);
      console.log(userName, email, password)
      // Uložení uživatele
      const newUser = new User({ userName, email, password: hashedPassword });
      await newUser.save();
  
      res.redirect('/login');
    } catch (error) {
      res.status(500).send('Error registering user: ' + error.message);
    }
  };


/*exports.login = (req, res, next) => {
    const {username, password} = req.body;
    userService.login({username, password}, (error, result) =>{
        if(error){
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: result,
        });
    });
};*/

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Najdi uživatele podle emailu
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).send('Invalid email or password');
      }
      
      // Porovnej hesla
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).send('Invalid email or password');
      }
      console.log(email, password);
      res.redirect('/');
    } catch (error) {
      res.status(500).send('Error logging in: ' + error.message);
    }
  };

exports.userProfile = (req, res, next) => {
    return res.status(200).json({message: "Authorized User"});
};