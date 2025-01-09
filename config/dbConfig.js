const mongoose = require('mongoose');
require('dotenv').config();

//connect to database 
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.error('MongoDB connection error:'+ err);
  }
};

module.exports = connectDB;