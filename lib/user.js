var rest = require('restler');
var Step = require('step');
var util = require('util');

function User(username, callback) {
  var self = this;
  self.username = username;
  self.has_github;
  self.github = new Github(username);
  self.has_scraperwiki;
  self.github.own = [];
  
  self.init(callback);
};

User.prototype.init = function(callback) {
  var self = this;
  
  Step(
    function () {
      self.github.getRepos(self, this);
    },
    function (all) {
      if (all == 'Not Found') {
        self.has_github = false;
      } else {
        self.has_github = true;
        for (var i in all) {
          if ((all[i].fork == false) && (all[i].owner.login == self.username)) {
            self.github.own.push(all[i]);
          }
        }
      }
      callback(self);
    }
  );
}

function callAPI(url, callback) {
  request = rest.get(url);
  request.addListener('success', function(data) {
    callback(data);
  });
  request.addListener('error', function(data) {
    console.log('Error fetching ' + url + '\nDetails: ' + util.inspect(data));
    callback(data.message);
  });
}


function Github(username) {
  this.username = username;
}

Github.prototype.getRepos = function(user, callback) {
  var self = user;
  
  var list = new Array();
  callAPI('https://api.github.com/users/' + self.username + '/repos?type=public', function(data) {
    if (data == "Not Found") {
      callback("Not Found");
    } else {
      list = data.sort(function compareDates(a, b) {
        var dateA=new Date(a.updated_at), dateB=new Date(b.updated_at);
        return dateB-dateA;
      });
      callback(list); 
    }
  });
}

Github.prototype.getWatchedRepos = function(user, callback) {
  var self = user;
  
  var list = new Array();
  callAPI('https://api.github.com/users/' + self.username + '/watched', function(data) {
    list = data.sort(function comparesDates(a, b) {
      var dateA=new Date(a.updated_at), dateB=new Date(b.updated_at);
      return dateB-dateA;
    });
    callback(list);
  });
}

Github.prototype.contributions = function(callback) {
  var self = this;
  
  Step(
    function () {
      self.getWatchedRepos(self, this);
      callback(this);
    },
    function (watched) {
      var potentials = [];
      for (var i in watched) {
        if (watched[i].owner.login != self.username) {
          potentials.push(watched[i]);
        }
      }
      var contribs = [];
      var group = this.group();
      potentials.forEach(function (repo) {
        self.checkForContribution(self.username, repo, contribs, group());
      });
    },
    function (contribs) {
      callback(contribs);
    }
  );
}

Github.prototype.checkForContribution = function(username, repo, list, callback) {
  var self = this;
  
  callAPI("https://github.com/api/v2/json/repos/show/" + repo.owner.login + "/" + repo.name + "/contributors", function(data) {
    contribs = data.contributors;
    for (var i in contribs) {
      if (contribs[i].login == self.username) {
       list.push(repo);
       break;
      }
    }
    callback(list);
  });
}


module.exports = User;