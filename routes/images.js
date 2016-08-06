'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const util = require('util');

exports.register = function(server, options, next) {

    const db = server.app.db;
    const mongojs = server.app.mongojs;

    server.route({
        method: 'POST',
        path: '/images/dp',
        handler: function(request, reply) {
            console.info("images dp POST");
            var req = request.payload.data;
            var resp = {
                data: {}
            };

            db.images.update({
                _uid: req._id,
                type: 'dp'
            }, {
                $set: {
                    base64: req.base64[0]
                }
            }, {
                upsert: true
            }, function(err, result) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                resp.status = "SUCCESS";
                resp.messages = "Uploaded.";
                reply(resp);
            });
        }
    });

    server.route({
        method: 'DELETE',
        path: '/images/{id}',
        handler: function(request, reply) {
            console.log("images DELETE");
            var req = request.params;
            var resp = {
                data: {}
            };

            /*switch (type) {
                case "own":
                    queryObj.ownImages = true;
                    break;
                case "home":
                    queryObj.homeImages = true;
                    break;
                case "dp":
                    queryObj.dp = true;
                    break;
            }*/

            db.images.remove({
                _id: mongojs.ObjectId(req.id)
            }, function(err, result) {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                resp.status = "SUCCESS";
                resp.messages = "Removed.";
                reply(resp);
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/images/{type}/{id}',
        handler: function(request, reply) {
            console.log("images GET");
            var req = request.params;
            var resp = {
                data: {}
            };

            /*switch (type) {
                case "own":
                    queryObj.ownImages = true;
                    break;
                case "home":
                    queryObj.homeImages = true;
                    break;
                case "dp":
                    queryObj.dp = true;
                    break;
            }*/
            db.images.find({
                _uid: req.id,
                type: req.type
            }, function(err, docs) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                console.log("docs: " + util.inspect(docs, false, null));
                resp.status = "SUCCESS";
                if (!docs) {
                    resp.data.images = {};
                    return reply(resp);
                }

                resp.data.images = docs;
                //resp.data.base64 = docs.type;
                return reply(resp);
                //reply(docs);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/images',
        handler: function(request, reply) {
            console.info("images POST");
            var req = request.payload.data;
            var resp = {
                data: {}
            };
            var queryObj = {};
            var images = [];
            var bulk = db.images.initializeOrderedBulkOp();
            for (var i = 0, len = req.base64.length; i < len; i++) {
                bulk.insert({
                    _uid: req._id,
                    type: req.type,
                    base64: req.base64[i]
                });
            }

            bulk.execute(function(err, result) {
                console.log('Done!')
                if (err) {
                    console.error("err: " + util.inspect(err, false, null));
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                console.log("result: " + util.inspect(result, false, null));

                resp.status = "SUCCESS";
                resp.messages = "Added";
                return reply(resp);
            });
            /*switch (req.type) {
                case "own":
                    queryObj.ownImages = req.base64;
                    break;
                case "home":
                    queryObj.homeImages = req.base64;
                    break;
                case "dp":
                    queryObj.dp = req.base64;
                    break;
            }*/

            /*db.images.insert(images, function(err, result) {
                if (err) {
                    console.error("err: " + util.inspect(err, false, null));
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                console.log("result: " + util.inspect(result, false, null));

                resp.status = "SUCCESS";
                resp.messages = "Added";
                return reply(resp);
            });*/
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
