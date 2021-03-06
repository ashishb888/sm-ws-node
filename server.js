'use strict';

const Hapi = require('hapi');
require('dotenv').config();
const mongojs = require('mongojs');
const moment = require('moment');
const util = require('util');
const ymlConfig = require('node-yaml-config');
const conf = ymlConfig.load(__dirname + '/config/config.yml', process.env.ENV);
const pre = require('./pre/pre.js');

console.log("ENV: " + process.env.ENV);

// Create a server with a host and port
const server = new Hapi.Server();

const jwtToken = {
  algorithm: "HS256",
  expiresIn: "240h"
};

server.app.jwtToken = jwtToken;

var validate = function(decoded, request, cb) {

  // do your checks to see if the person is valid
  console.log("request.headers.authorization Validate: " + request.headers.authorization);
  console.log("Decoded token: " + util.inspect(decoded, false, null));

  /*if (!people[decoded.id]) {
    return cb(null, false);
  }
  else {
    return cb(null, true);
  }*/
  cb(null, true);
};


server.connection({
  /*host:"localhost",*/
  port: conf.server.port,
  routes: {
    cors: true
  }
});

server.register(require('hapi-auth-jwt2'), function(err) {

  if (err) {
    console.log(err);
  }
  // Change secret key
  server.auth.strategy('jwt', 'jwt', {
    key: 'NeverShareYourSecret',
    validateFunc: validate, // validate function defined above
    verifyOptions: {
      algorithms: ['HS256'],
      tokenType: "bearer",
      complete: true,
      ignoreExpiration: true
    }
  });

  server.auth.default('jwt');

  server.route([{
    method: "GET",
    path: "/",
    config: {
      auth: false/*,
      pre: [{
        method: pre.log,
        assign: 'log'
      }]*/
    },
    handler: function(request, reply) {
      pre.log();
      reply({
        text: 'Token not required'
      });
    }
  }, {
    method: 'GET',
    path: '/restricted',
    config: {
      auth: 'jwt'
    },
    handler: function(request, reply) {
      console.log("request.headers.authorization: " + request.headers
        .authorization);
      console.log("equest.auth.token: " + util.inspect(request.auth
        .token, false, null));
      console.log("request.auth.credentials: " + util.inspect(
        request.auth.credentials, false, null));
      reply({
          text: 'You used a Token!'
        })
        .header("Authorization", request.headers.authorization);
    }
  }]);
});

const opts = {
  file: {
    filename: conf.logs.dir + '/sm-ws.log',
    format: ':level :time :data',
    timestamp: 'HH:mm:ss',
    accessFormat: ':time :level :method :status :url'
  },
  console: {
    color: true
  }
  /*,
    syslog: {
      host: 'localhost',
      port: 514,
      facility: 18
    },
    logstash: {
      redis: true, // send as redis pubsub messages
      // udp: true, // or send directly over UDP, *NOTE* you can only use one or the other, never both
      host: '127.0.0.1', // defaults to localhost
      port: 12345, // defaults to 6379 for redis, 9999 for udp
      key: 'bucker_logs', // defaults to 'bucker', this is only used for the redis transport
      channel: true, // use redis pubsub
      list: false, // use a redis list *NOTE* if channel is false, list usage is forced
      source_host: 'bacon.com' // this sets the @source_host field in logstash
    }*/
};


var logger = require('bucker').createLogger({
  access: conf.logs.dir + '/access.log',
  error: conf.logs.dir + '/error.log',
  app: {
    file: conf.logs.dir + '/app.log'
  },
  console: true
}, module);
/*logger.info('informational message');
logger.debug('debug message');
logger.warn('warning');
logger.error('error');
logger.log('also works for informational messsages');
logger.module('something_else').info('and you can override the module name temporarily if you want');
logger.tags(['showing', 'off']).info('and we also support tags now');
*/
server.app.logger = logger;

const options = {
  ops: {
    interval: 1000
  },
  reporters: {
    console: [{
      module: 'good-squeeze',
      name: 'Squeeze',
      args: [{
        log: '*',
        response: '*'
      }]
    }, {
      module: 'good-console'
    }, 'stdout'],
    file: [{
      module: 'good-squeeze',
      name: 'Squeeze',
      args: [{
        response: '*',
        log: '*'
      }]
    }, {
      module: 'good-squeeze',
      name: 'SafeJson',
      args: [{
        response: '*',
        log: '*'
      }]
    }, {
      module: 'good-file',
      args: [conf.logs.dir + '/good.log']
    }]
  }
};

//Connect to db
server.app.db = mongojs(conf.database.db, conf.database.collections);

server.app.db.on('error', function(err) {
  console.log('database error', err)
})

server.app.db.on('connect', function() {
  console.log('database connected')
})

// Use mongojs throughout the app
server.app.mongojs = mongojs;

// Use moment
server.app.moment = moment;

// Global response object
server.app.resp = {
  status: "SUCCESS",
  data: {}
};

// Serve default route
/*server.route({
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    reply('Hello, world!');
  }
});*/

/*const table = server.connections[0].table();
console.log("table: " + table);*/

//Load plugins and start server
server.register([
  require('./routes/users'),
  require('./routes/images'),
  require('./routes/initapp'), {
    register: require('good'),
    options: options
  }
], (err) => {

  if (err) {
    throw err;
  }

  // Start the server
  server.start((err) => {
    console.log('Server running at:', server.info.uri);
  });
});
