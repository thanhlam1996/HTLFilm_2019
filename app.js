var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");
var app = express();
var session = require('express-session');
var passport=require('passport');




var indexRouter = require('./routes/index');
var admin = require('./routes/admin');
var usersRouter = require('./routes/users');
var movie=require('./routes/movie');
var account=require('./routes/account');
var notification=require('./routes/notification');










var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var movie = require("./routes/movie");
var account = require("./routes/account");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

app.use(express.static(__dirname + "/public/images/icon/"));
app.use(express.static(__dirname + "/public/images/uploads/"));
app.use(express.static(__dirname + "/public/images/movie/"));
app.use(express.static(__dirname + "/public/images/img_animation/"));
app.use(express.static(__dirname + "/public/javascripts/"));
app.use(express.static(__dirname + "/public/stylesheets/"));
app.use(express.static(__dirname + "/public/images/"));
app.use(express.static(__dirname + "/config/"));
app.use(express.static(__dirname + "/data/"));
app.use(express.static(__dirname + "/public/emails/"));

// Route----------------------------------------------------------
// var searchRouter=require('./routes/route_search');
// ---------------------------------------------------------------

// view engine setup
app.set("views", path.join(__dirname, "views"));
// app.set('views', path.join(__dirname, 'viewspartials'));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());
app.use(passport.session());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  maxAge: 1000 * 60 * 60 * 24,
  cookie: {}
}))

app.use('/', indexRouter);
app.use('/movie',movie);
app.use('/account',account);
app.use('/users', usersRouter);
app.use('/admin', admin);
app.use('/notification', notification);












// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
// =================================================Movies==================================================

// =========================================================================================================
module.exports = app;
