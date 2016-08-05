'use strict';

const Hapi = require('hapi');
const mongojs = require('mongojs');

// Create a server with a host and port
const server = new Hapi.Server();

var people = { // our "users database"
    1: {
      id: 1,
      name: 'Jen Jones'
    }
};

var validate = function (decoded, request, callback) {

    // do your checks to see if the person is valid
    if (!people[decoded.id]) {
      return callback(null, false);
    }
    else {
      return callback(null, true);
    }
};

/*server.register(require('hapi-auth-jwt2'), function (err) {

    if(err){
      console.log(err);
    }

    server.auth.strategy('jwt', 'jwt',
    { key: 'NeverShareYourSecret',          // Never Share your secret key
      validateFunc: validate,            // validate function defined above
      verifyOptions: { algorithms: [ 'HS256' ] } // pick a strong algorithm
    });

    server.auth.default('jwt');

    server.route([
      {
        method: "GET", path: "/", config: { auth: false },
        handler: function(request, reply) {
          reply({text: 'Token not required'});
        }
      },
      {
        method: 'GET', path: '/restricted', config: { auth: 'jwt' },
        handler: function(request, reply) {
          reply({text: 'You used a Token!'})
          .header("Authorization", request.headers.authorization);
        }
      }
    ]);
});
*/
server.connection({
  /*host:"localhost",*/
  port: 3000
    /*,
      options: {
        cors: true
      }*/
});

const opts = { file: {
    filename: './logs/sm-ws.log',
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


var logger = require('bucker').createLogger({ access: './logs/access.log', error: './logs/error.log', app: { file: './logs/app.log' }, console: true }, module);
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
            args: ['./logs/good.log']
        }]
    }
};

//Connect to db
server.app.db = mongojs('smdb', ['users', 'images']);

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
