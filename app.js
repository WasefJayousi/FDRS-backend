require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const authRouter = require('./routes/authRouter');
const ResourceRouter = require('./routes/ResourcesRouter')
const facultyRouter = require('./routes/FacultyRouter')
const commentRouter = require('./routes/commentRouter')
const favoriteRouter = require('./routes/FavoriteRouter')
const UserRouter = require('./routes/UsersRouter')
const feedbackrouter = require('./routes/FeedBackRouter')
const passport = require('passport');
const cors = require("cors");
require("./passport-config")(passport);
const mongoose = require("mongoose");

// Set `strictQuery: false` to globally opt into filtering by properties that aren't in the schema
// Included because it removes preparatory warnings for Mongoose 7.
// See: https://mongoosejs.com/docs/migrating_to_6.html#strictquery-is-removed-and-replaced-by-strict
mongoose.set("strictQuery", false);

// Define the database URL to connect to.
const mongoDB = process.env.MongoDB_URL;

// Connect to MongoDB
main().catch((err) => console.log(err));
async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Debug: Should be connected?");
}

const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000','https://fdrs1.up.railway.app/'];
// Create a custom CORS middleware that checks the origin header
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      // If the origin is in the allowed list or it's not defined, allow the request
      callback(null, true);
    } else {
      // Otherwise, reject the request
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200, // Set the success status to 200
};

const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors(corsOptions));
app.use(passport.initialize());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api_auth', authRouter);
app.use('/api_resource', ResourceRouter)
app.use('/api_faculty' ,facultyRouter )
app.use('/api_comment' , commentRouter)
app.use('/api_favorite' ,favoriteRouter )
app.use('/api_user',UserRouter)
app.use('/api_feedback' ,feedbackrouter)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
