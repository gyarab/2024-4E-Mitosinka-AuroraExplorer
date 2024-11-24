const bcrypt = require('bcrypt')
const userService = require("../services/usersServices");
const User = require("../models/User")

exports.register = (req, res, next) => {
    const salt = bcrypt.genSalt(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    const userName = req.body.userName;
    const email = req.body.email;
    

    
};

exports.login = (req, res, next) => {
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
};

exports.userProfile = (req, res, next) => {
    return res.status(200).json({message: "Authorized User"});
};