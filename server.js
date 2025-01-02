const express = require('express');
const app = express(); 
const port = 3000;
const path = require('path');
const {logger} = require('./middleware/logEvents');
const connectDB = require('./config/dbConfig');
const cookieParser = require('cookie-parser');
const attachUser = require('./middleware/attachUser');

app.use(logger);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

connectDB();

app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(attachUser); 
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use('/', require('./routes/routes.js'));
app.use('/users', require('./routes/userRoutes.js'));
app.use('/aurorex', require('./routes/aurorexRoutes.js'));


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  
});




