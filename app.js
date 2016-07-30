'use strict';

const Hapi = require('hapi');
const mongojs = require('mongojs');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  /*host:"localhost",*/
  port: 3000/*,
  options: {
    cors: true
  }*/
});

//Connect to db
server.app.db = mongojs('smdb', ['user']);

//Load plugins and start server
server.register([
    require('./routes/users')
], (err) => {

    if (err) {
        throw err;
    }

    // Start the server
    server.start((err) => {
        console.log('Server running at:', server.info.uri);
    });

});
