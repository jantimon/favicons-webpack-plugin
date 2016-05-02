/**
 * This is just an example for the webpack middleware
 * you can also run this example with the webpack cli or
 * the webpack-dev-server cli
 */
'use strict';
var webpackMiddleware = require('webpack-dev-middleware');
var webpack = require('webpack');
var express = require('express');
var app = express();
app.use(webpackMiddleware(webpack(require('./webpack.config.js'))));
app.listen(3000);
console.log('Starting up http://localhost:3000');
