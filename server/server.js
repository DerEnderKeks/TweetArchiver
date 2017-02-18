/**
 * This file is part of TweetArchiver
 * Copyright (c) 2017 DerEnderKeks
 * See the LICENSE file for more information
 */

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const HttpStatus = require('http-status-codes');
const http = require('http');
const config = require('config');

const app = express();

const routes = {
  index: require(path.join(__dirname, 'routes', 'index')),
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(function (req, res, next) {
  res.removeHeader("x-powered-by"); // GO AWAY USELESS HEADER! (╯°□°）╯︵ ┻━┻
  next();
});

app.use(logger('dev'));

app.use(require('express-minify')({
  js_match: /js/,
  css_match: /css/,
  uglifyJS: undefined,
  cssmin: undefined,
  cache: __dirname + '/cache/',
  onerror: undefined
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes.index);

/*
 * catch 404 and forward to error handler
 */
app.use(function (req, res, next) {
  let err = new Error(HttpStatus.getStatusText(404));
  err.status = 404;
  next(err);
});

// Error handler

if (process.env.NODE_ENV === 'development') {
  /*
   * Development error handler (will print stacktrace)
   */
  app.use(function (err, req, res, next) {
    if (res._header) return;
    console.error(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      status: err.status
    });
  });
} else {
  /*
   * Production error handler (no stacktraces leaked to user)
   */
  app.use(function (err, req, res, next) {
    if (res._header) return;
    res.status(err.status || 500);
    res.render('error', {
      message: HttpStatus.getStatusText(res.statusCode),
      error: '',
      status: res.statusCode,
      title: HttpStatus.getStatusText(res.statusCode)
    });
  });
}

const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;  // named pipe
  if (port >= 0) return port; // port number
  return false;
};

const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Webserver listening on ' + bind);
};


const port = normalizePort(process.env.PORT || config.get('web.port') || '3000');
app.set('port', port);

const trustedProxies = config.get('web.trustedProxies');
app.set('trust proxy', trustedProxies);

const server = http.createServer(app);

const address = config.get('web.address');

server.listen(port, address);
server.on('error', onError);
server.on('listening', onListening);

