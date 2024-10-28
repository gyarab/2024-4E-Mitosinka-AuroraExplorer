const usersDB = {
    users: require('../model/user.json'),
    setUsers: function (data) {this,users = data}
}

const bcrypot = require('bcrypt')

const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleLogin = async (req, res) => {

}