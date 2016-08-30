'use strict';

const util = require('util');

function log(data) {
  console.log(data);
}

function logObj(lable, obj) {
  console.log(lable + ": " + util.inspect(obj, false, null));
}

module.exports = {
  log: log,
  logObj: logObj
};
