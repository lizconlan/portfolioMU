/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express.createServer();
var util = require('util')
var Step = require('step');

var GithubList = require('./lib/github.js')

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});


process.addListener('uncaughtException', function (err, stack) {
  console.log('------------------------');
  console.log('Exception: ' + err);
  console.log(err.stack);
  console.log('------------------------');
});

// Routes
app.get('/', function(req, res){
  new GithubList('lizconlan', function (data) {
    res.render('github-own', {
      user: data.username
      , own: data.own
    })
  });
});


app.get('/:username', function (req, res){
  new GithubList(req.params.username, function (data) {
    res.render('github-own', {
      user: data.username
      , own: data.own
    })
  });
});

// start the server!
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});



