/**
 * Module dependencies.
 */

var express = require('express');
var rest = require('restler');
var app = module.exports = express.createServer();
var util = require('util')
var Step = require('step');

//var scraperwiki = require('./lib/scraperwiki.js')

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
  //sw = new scraperwiki('lizconlan');
  function loadAll(username, callback) {
    Step(
      function () {
        getData(username, this);
      },
      function (list) {
        var repos = new Array();
        var group = this.group();
        list.forEach(function (repo) {
          getDetail(repo, repos, group());
        });
      },
      function (list) {
        callback(list);
      }
    )
  }
  
  loadAll('lizconlan', function(repos) {
    res.render('stuff', {
      user: 'lizconlan',
      own: repos
    });
  });  
});



function getData(username, callback) {
  var list = new Array();
  rest.get('https://api.scraperwiki.com/api/1.0/scraper/getuserinfo?format=jsondict&username=' + username ).on('complete', function(data) {
    projects = data[0].coderoles.owner;
    for (var i in projects) {
      if (projects[i].indexOf(".emailer") < 0) {
        list.push(projects[i]);
      }
    }
    // for (var i in list) {
    //   getDetail(list[i], function(repo_data) {
    //     own.push(repo_data);
    //   });
    // }
    callback(list);
  });
}

function getDetail(repo, list, callback) {
  var link = "https://scraperwiki.com/scrapers/" + repo;
  rest.get("https://api.scraperwiki.com/api/1.0/scraper/getinfo?format=jsondict&name=" + repo + "&version=-1").on('complete', function(data) {
    repo_data = {"sw_name": repo, "name": data[0].title, "html_url": link, "language": data[0].language, "description": data[0].description, "homepage": ""}
    list.push(repo_data);
    callback(list);
  });
}

// Only listen on $ node app.js
if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}



