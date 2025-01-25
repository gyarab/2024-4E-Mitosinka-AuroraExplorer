//server configuration file

const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const {logger, logEvents} = require('./middleware/logEvents');
const connectDB = require('./config/dbConfig');
const cookieParser = require('cookie-parser');
const attachUser = require('./middleware/attachUser');
const https = require("https");
const fs = require("fs");
const bodyParser = require("body-parser");



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(logger);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());

app.use(express.urlencoded({ extended: false }));
connectDB();

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(attachUser);
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//routes for scripts
app.use('/scripts', express.static('scripts', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

//set up routes for different directories
app.use('/', require('./routes/routes.js'));
app.use('/users', require('./routes/userRoutes.js'));
app.use('/aurorex', require('./routes/aurorexRoutes.js'));


//settings HTTPS server
const options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.cert"),
};
//run HTTPS server
https.createServer(options, app).listen(port, function (req, res) {
  console.log("Server started at port 3000");
});




