function PortfolioClient(clientpath) {
  var self = this;
  this.clientpath = clientpath;
  
  this.init = function() {
    self.setupBayeuxHandlers();
  };
  
  this.setupBayeuxHandlers = function() {
    self.client = new Faye.Client('/faye', {
      timeout: 30
    });
    
    self.client.subscribe(clientpath, function(message) {
      if (message.html != "") {
        $('#' + message.section).append(message.html);
        $('#' + message.section).show();
      }
    });
  };
  
  this.init();
}

var portfolioClient;
jQuery(function() {
  portfolioClient = new PortfolioClient(window.location.pathname);
});

