var rest = require('restler');
var Step = require('step');


function GithubList(username, callback) {
  var self = this;
  self.username = username;
  self.own = [];
  
  self.init(callback);
};

GithubList.prototype.init = function(callback) {
  var self = this;
  
  Step(
    function () {
      getRepos(self, 5, this);
    },
    function (all) {
      for (var i in all) {
        if ((all[i].fork == false) && (all[i].owner.login == self.username)) {
          self.own.push(all[i]);
        }
      }
      callback(self);
    }
  );
}

GithubList.prototype.contributor = function(callback) {
  var self = this;
  
  Step(
    function () {
      getWatching(self, 5, this);
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
        checkForContribution(self.username, repo, contribs, 5, group());
      });
    },
    function (contribs) {
      callback(contribs);
    }
  );
}

function getRepos(gh, maxtries, callback) {
  var self = gh;
  
  var list = new Array();
  rest.get('https://api.github.com/users/' + self.username + '/repos?type=public').on('complete', function(data) {
    list = data.sort(function compareDates(a, b) {
      var dateA=new Date(a.updated_at), dateB=new Date(b.updated_at);
      return dateB-dateA;
    });
    callback(list);
  });
}

function getWatching(gh, maxtries, callback) {
  var self = gh;
  
  var list = new Array();
  rest.get('https://api.github.com/users/' + self.username + '/watched').on('complete', function(data) {
    list = data.sort(function comparesDates(a, b) {
      var dateA=new Date(a.updated_at), dateB=new Date(b.updated_at);
      return dateB-dateA;
    });
    callback(list);
  });
}

function checkForContribution(username, repo, list, maxtries, callback) {
  rest.get("https://github.com/api/v2/json/repos/show/" + repo.owner.login + "/" + repo.name + "/contributors").on('complete', function(data) {
    contribs = data.contributors
    for (var i in contribs) {
     if (contribs[i].login == username) {
       list.push(repo);
       break;
     }
    }
    callback(list);
  });
}

module.exports = GithubList;