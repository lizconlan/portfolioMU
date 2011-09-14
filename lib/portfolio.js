var express = require('express'),
    util = require('util'),
    Step = require('step'),
    faye = require('faye'),
    jade = require('jade'),
    fs = require('fs');

var GithubList = require('../lib/github.js');

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
    timeout: 45
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
    new GithubList('lizconlan', function (data) {
      res.render('outline', {
        wrapper: true
        , user: data.username
        , stuff: data.own
      })
    });
  });

  app.get('/:username', function(req, res) {
    req.isXMLHttpRequest;
    gh = new GithubList(req.params.username, function (gh) {
      Step(
         function() {
           res.render('outline', {
             wrapper: true
             , user: gh.username
             , stuff: gh.own
           })
           callback(this);
         },
         function() {
           var fn = jade.compile(fs.readFileSync(__dirname + '/../views/github.jade', 'utf-8'));
           gh.contributor(function(contribs) {
             self.bayeux.getClient().publish('/data', {
               section: 'github-collab', moo: contribs, html: fn({
                  wrapper: false 
                  , user: gh.username
                  , stuff: contribs
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