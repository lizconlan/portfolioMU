var rest = require('restler');
var Step = require('step');


function GithubList(username, callback) {
  var self = this;
  self.username = username;
  
  self.init(callback);
};

GithubList.prototype.init = function(callback) {
  var self = this;
  
  Step(
    function () {
      getOwn(self, 5, this);
    },
    function () {
      callback(self);
    }
  );
}

function getOwn(gh, maxtries, callback) {
  var self = gh;
  
  var list = new Array();
  rest.get('https://api.github.com/users/' + self.username + '/repos?type=public').on('complete', function(data) {
    gh.own = data.sort(function compareDates(a, b) {
      var dateA=new Date(a.updated_at), dateB=new Date(b.updated_at);
      return dateB-dateA;
    });
    callback();
  });
}



module.exports = GithubList;