const express = require('express');
const app = express(); 
const port = 3000;
const path = require('path');
const {logger} = require('./middleware/logEvents');
const connectDB = require('./config/dbConfig');

app.use(logger);

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); 
app.use(express.json());
app.use(express.urlencoded({extended: false}));

connectDB();

app.use(express.static(path.join(__dirname, 'public')));


app.use('/', require('./routes/routes.js'));
app.use('/users', require('./routes/users.js'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  
});




