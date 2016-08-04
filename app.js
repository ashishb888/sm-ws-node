'use strict';

const Hapi = require('hapi');
const mongojs = require('mongojs');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  /*host:"localhost",*/
  port: 3000
    /*,
      options: {
        cors: true
      }*/
});

const opts = { file: {
    filename: './test/file',
    format: ':level :time :data',
    timestamp: 'HH:mm:ss',
    accessFormat: ':time :level :method :status :url'
  },
  console: {
    color: false
  }/*,
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

var logger = require('bucker').createLogger({ access: 'access.log', error: 'error.log', app: { file: 'app.log' }, console: true }, module);

logger.info('informational message');
logger.debug('debug message');
logger.warn('warning');
logger.error('error');
logger.log('also works for informational messsages');
logger.module('something_else').info('and you can override the module name temporarily if you want');
logger.tags(['showing', 'off']).info('and we also support tags now');

const options = {
    ops: {
        interval: 1000
    },
    reporters: {
        console: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ log: '*', response: '*' }]
        }, {
            module: 'good-console'
        }, 'stdout'],
        file: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{response: '*', log: '*'}]
        }, {
            module: 'good-squeeze',
            name: 'SafeJson'
        }, {
            module: 'good-file',
            args: ['./test/fixtures/awesome_log']
        }]
    }
};

//Connect to db
server.app.db = mongojs('smdb', ['user']);

// Use mongojs throughout the app
server.app.mongojs = mongojs;

// Global response object
server.app.resp = {
  status: "SUCCESS",
  data: {
  }
};

// Serve default route
server.route({
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    reply('Hello, world!');
  }
});

/*const table = server.connections[0].table();
console.log("table: " + table);*/

//Load plugins and start server
server.register([
  require('./routes/users'),
  require('./routes/images'),
  {
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
