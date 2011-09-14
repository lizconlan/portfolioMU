process.addListener('uncaughtException', function (err, stack) {
  console.log('------------------------');
  console.log('Exception: ' + err);
  console.log(err.stack);
  console.log('------------------------');
});

var Portfolio = require('./lib/portfolio');

new Portfolio({
  port: process.env.PORT || 3000
});