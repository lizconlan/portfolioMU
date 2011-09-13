var rest = require('restler');
var Step = require('step');


function ScraperwikiList(username, callback) {
  var self = this;
  self.username = username;
  
  self.init(callback);
};

ScraperwikiList.prototype.init = function(callback) {
  var self = this;
  
  Step(
    function () {
      getLists(self, 5, this);
    },
    function () {
      // var repos = new Array();
      // var group = this.group();
      // self.ownList.forEach(function (repo) {
      //   getDetail(repo, repos, 5, group());
      // });
      callback(self);
    }// ,
    //     function () {
    //       self.own = list;
    //       callback(self);
    //     }
  )
};

function getLists(sw, maxtries, callback) {
  var self = sw;
    
  var list = new Array();
  rest.get('https://api.scraperwiki.com/api/1.0/scraper/getuserinfo?format=jsondict&username=' + self.username ).on('complete', function(data) {
    self.ownList = new Array();
    projects = data[0].coderoles.owner;
    for (var i in projects) {
      if (projects[i].indexOf(".emailer") < 0) {
        self.ownList.push(projects[i]);
      }
    }
    // console.log(self.ownList);
    
    self.editList = data[0].coderoles.editor;
    callback();
  });
}

function getDetail(repo, list, maxtries, callback) {
  var link = "https://scraperwiki.com/scrapers/" + repo;
  rest.get("https://api.scraperwiki.com/api/1.0/scraper/getinfo?format=jsondict&name=" + repo + "&version=-1").on('complete', function(data) {
    getDetail(repo, list, maxtries--, callback);
    repo_data = {"sw_name": repo, "name": data[0].title, "html_url": link, "language": capLanguage(data[0].language), "description": data[0].description, "homepage": ""}
    list.push(repo_data);
    callback(list);
  });
}

function capLanguage(text) {
  if (text == "php") {
    return "PHP"
  } else {
    first = text.charAt(0);
    return first.toUpperCase() + text.substring(1);
  }
}

module.exports = ScraperwikiList;