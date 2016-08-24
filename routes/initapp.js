'use strict';

const Boom = require('boom');
const Joi = require('joi');
const util = require('util');

exports.register = function(server, options, next) {

  const db = server.app.db;
  const mongojs = server.app.mongojs;

  server.route({
    method: 'GET',
    path: '/initapp',
    handler: function(request, reply) {
      var req = request.params;
      var resp = {
        data: {}
      };

      db.util.findOne({}, (err, doc) => {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        console.log("doc: " + util.inspect(doc, false, null));

        resp.status = "SUCCESS";
        if (!doc) {
          resp.data = {};
          return reply(resp);
        }

        resp.data = doc;
        return reply(resp);
      });
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'routes-initapp'
};
