const User = require('../model/User');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
    const {usersDB, pwd} = req.body;
    if(!user || !pwd)return res.status(400);

    const duplicate = await User.findOne({username: user}).exec();
    if(duplicate) return res.sendStatus(409);

    try{
        const hashedPwd = bcrypt.hash(pwd, 10);

        const result = await User.create({
            "username": user,
            "email": email,
            "password": hashedPwd
        });

        res.status(201)
    }
    catch{
        console.error;
    }
};