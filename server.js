const express = require('express');
const app = express(); 
const port = 3000;
const path = require('path');
const mongoose = require('mongoose');
//const User = require()
const logEvents = require('./logEvents');






/*const connectDB = async () => {
  try {
      await mongoose.connect('mongodb+srv://pepa:UgP49VNFcevKHGX8@aurora.7u9aw.mongodb.net/?retryWrites=true&w=majority&appName=Aurora', {
          
      });
      console.log('MongoDB connected');
  } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
  }
};
connectDB();*/


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html')); 
})

app.get('/forecast(.html)?', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'forecast.html'));
});

app.get('/gallery(.html)?', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'gallery.html'));
});

app.get('/*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});


app.listen(port, () => {
  console.log(`Server running at http://10.34.11.31:${port}`);
});


