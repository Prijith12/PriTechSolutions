const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { engine } = require('express-handlebars');
const fileupload=require('express-fileupload');
const db=require('./config/connection')
const session=require('express-session')


const userRouter = require('./routes/user');
const adminRouter=require('./routes/admin')

const app = express();

// Set up Handlebars engine using destructured engine() function
app.engine('.hbs', engine({
  defaultLayout: 'layout',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layout'), // Path to your layout folder
  partialsDir: [
    path.join(__dirname, 'views/partials') // Path to your partials folder
    
  ]
}));
app.set('view engine', '.hbs');

// Setting views directory
app.set('views', path.join(__dirname, 'views'));

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload())
app.use(session({secret:'key',cookie:{maxAge:60000}}))

db.connect();




// Routes handling
app.use('/', userRouter);
app.use('/admin', adminRouter);


// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
