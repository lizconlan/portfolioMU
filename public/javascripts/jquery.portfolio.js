function PortfolioClient() {
  var self = this;
  
  this.init = function() {
    self.setupBayeuxHandlers();
  };
  
  this.setupBayeuxHandlers = function() {
    self.client = new Faye.Client('/faye', {
      timeout: 120
    });
    
    self.client.subscribe('/data', function(message) {
      $('#' + message.section).append(message.html);
    });
  };
  
  this.init();
}

var portfolioClient;
jQuery(function() {
  portfolioClient = new PortfolioClient();
});

