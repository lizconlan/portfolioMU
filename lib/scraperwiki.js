var rest = require('restler');
var Step = require('step');


function ScraperwikiList(username, callback) {
  this.username = username;
  this.own = new Array();
  setOwn(username, function(data) {
    this.own = data;
    callback(this);
  });
  
  function setOwn(username, callback) {
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
  
  function getData(username, callback) {
    var list = new Array();
    rest.get('https://api.scraperwiki.com/api/1.0/scraper/getuserinfo?format=jsondict&username=' + username ).on('complete', function(data) {
      projects = data[0].coderoles.owner;
      for (var i in projects) {
        if (projects[i].indexOf(".emailer") < 0) {
          list.push(projects[i]);
        }
      }
      callback(list);
    });
  }

  function getDetail(repo, list, callback) {
    var link = "https://scraperwiki.com/scrapers/" + repo;
    rest.get("https://api.scraperwiki.com/api/1.0/scraper/getinfo?format=jsondict&name=" + repo + "&version=-1").on('complete', function(data) {
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
};

module.exports = ScraperwikiList;