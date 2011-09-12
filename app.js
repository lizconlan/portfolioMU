/**
 * Module dependencies.
 */

var express = require('express');
var rest = require('restler');
var app = module.exports = express.createServer();
var util = require('util')
var Step = require('step');

var scraperwiki = require('./lib/scraperwiki.js')

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

// Routes

app.get('/', function(req, res){
  result = new scraperwiki('lizconlan', function(sw) {
    res.render('stuff', {
          user: sw.username
        , own: sw.own
        });
  });
});


// start the server!
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});



