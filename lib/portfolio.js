var express = require('express'),
    util = require('util'),
    Step = require('step'),
    faye = require('faye'),
    jade = require('jade'),
    fs = require('fs');

var User = require('../lib/user.js');

function Portfolio(options) {
  if (! (this instanceof arguments.callee)) {
    return new arguments.callee(arguments);
  }

  var self = this;

  self.settings = {
    port: options.port
  };

  self.init();
}


Portfolio.prototype.init = function() {
  var self = this;

  self.bayeux = self.createBayeuxServer();
  self.httpServer = self.createHTTPServer();

  self.bayeux.attach(self.httpServer);
  self.httpServer.listen(self.settings.port, function() {
    console.log("Listening on " + self.settings.port);
  });
  util.log('Server started on PORT ' + self.settings.port);
};

Portfolio.prototype.createBayeuxServer = function() {
  var self = this;
  
  var bayeux = new faye.NodeAdapter({
    mount: '/faye',
    timeout: 25
  });
  
  return bayeux;
};

Portfolio.prototype.createHTTPServer = function() {
  var self = this;
  
  var app = express.createServer();
  
  app.configure(function(){
    app.set('views', __dirname + '/../views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(require('stylus').middleware({ src: __dirname + '/../public' }));
    app.use(app.router);
    app.use(express.static(__dirname + '/../public'));
  });

  app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  });

  app.configure('production', function(){
    app.use(express.errorHandler()); 
  });

  self.bayeux.attach(app);

  // Routes
  app.get('/', function(req, res){
    res.send("instructions go here...")
  });
  
  app.get('/favicon.ico', function(req,res) {
    res.send("");
  });

  app.get('/:username', function(req, res) {
    gh = new User(req.params.username, function (user) {
      Step(
        function() {
          res.render('outline', {
            user: user
          });
          callback();
         },
         function() {
           var fn = jade.compile(fs.readFileSync(__dirname + '/../views/github.jade', 'utf-8'));
           user.github.contributions(function(contribs) {
             self.bayeux.getClient().publish('/' + user.username, {
               section: 'github-collab', html: fn({
                  stuff: contribs
               })
             });
           });
         }
       );
    });
  });

  return app;
};

module.exports = Portfolio;