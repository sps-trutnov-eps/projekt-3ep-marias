const express = require('express');
const session = require('express-session');
const ws = require('express-ws')(express());

const app = ws.app;

app.set('view engine', 'ejs');
app.set('views', './app/views');

app.use(session({
    secret: require('../conf').secret,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

app.use(express.static('www'));

app.use('/', require('./routers/allRouter.js'));

module.exports = app;
