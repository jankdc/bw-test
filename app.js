const express = require('express');
const logger = require('morgan');
const path = require('path');
const app = express();

// routes
const indexRoute = require('./routes/index');
const apiRoute = require('./routes/api');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// only output request logs in development or production
if (app.get('env') !== 'test') {
    app.use(logger('dev'));
}

app.use('/', indexRoute);
app.use('/api', apiRoute);
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

// make html source pretty when debugging
app.locals.pretty = app.get('env') === 'development';

module.exports = app;
