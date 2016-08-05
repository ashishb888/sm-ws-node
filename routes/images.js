'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');

exports.register = function(server, options, next) {

    const db = server.app.db;
    const mongojs = server.app.mongojs;

    server.route({
        method: 'GET',
        path: '/images/{type}/{id}',
        handler: function(request, reply) {
            var id = request.params.id;
            var type = request.params.type;
            var queryObj = {};

            switch (type) {
                case "own":
                    queryObj.ownImages = true;
                    break;
                case "home":
                    queryObj.homeImages = true;
                    break;
                case "dp":
                    queryObj.dp = true;
                    break;
            }
            db.images.find({
                _id: mongojs.ObjectId(id)
            }, queryObj, function(err, docs) {
                var resp = {
                  data: {}
                };

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                resp.status = "SUCCESS";
                if (!docs.type) {
                  resp.data.base64 = [];
                  return reply(resp);
                }
                var resp = {
                    data: {}
                };

                console.log("resp: " + JSON.stringify(resp));
                resp.data.base64 = docs.type;
                return reply(resp);
                //reply(docs);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/images',
        handler: function(request, reply) {
          var req = request.payload.data;
            var resp = {
                data: {}
            };
            var queryObj = {};

            switch (req.type) {
                case "own":
                    queryObj.ownImages = true;
                    break;
                case "home":
                    queryObj.homeImages = true;
                    break;
                case "dp":
                    queryObj.dp = true;
                    break;
            }

            db.images.update({
                _id: mongojs.ObjectId(request.payload.data._id)
            }, {
                $set: {
                    ownImgs: request.payload.data.ownImgs
                }
            }, function(err, result) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (result.n === 0) {
                    return reply(Boom.notFound());
                }

                resp.status = "SUCCESS";
                resp.messages = "Added";
                return reply(resp);

                //reply().code(204);
            });

        }
    });

    server.route({
        method: 'GET',
        path: '/images/{id}',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            db.images.find({
                _id: mongojs.ObjectId(request.params.id)
            }, {
                ownImgs: true
            }, function(err, docs) {
                var resp = {
                    data: {}
                };
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                resp.status = "SUCCESS";
                if (!docs.ownImgs) {
                    resp.messages = "No images.";
                    var ownImgs = [];
                    resp.data.base64 = docs[0].ownImgs;
                    return reply(resp);
                }

                resp.messages = "Images";
                console.log("resp: " + JSON.stringify(resp));
                resp.data.base64 = docs[0].ownImgs;
                return reply(resp);
                //reply(docs);
            });
        }
    });


    return next();
};

exports.register.attributes = {
    name: 'routes-images'
};
