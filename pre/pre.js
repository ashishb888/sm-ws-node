'use strict';

const util = require('util');

/*module.exports = {
  log: function(req) {
    console.log("req: " + util.inspect(req, false, null));
  },

  sayHelloInSpanish: function() {
    return "Hola";
  }
};*/

function log(req, res) {
  console.log("req: " + util.inspect(req, false, null));
}

module.exports = {
  log: log
};
