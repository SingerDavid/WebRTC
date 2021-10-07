const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const io = require('socket.io')();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

const namespaces = io.of(/^\/[0-9]{6}$/);
namespaces.on('connection', function() {
  const namespace = socket.nsp;
  socket.broadcast.emit('connected peer')

  console.log("heard a connection on namespace", namespace);
});

module.exports = { app, io };
