const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://pepa:UgP49VNFcevKHGX8@aurora.7u9aw.mongodb.net/?retryWrites=true&w=majority&appName=Aurora', {
            
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;