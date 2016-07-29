'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');

exports.register = function(server, options, next) {

    const db = server.app.db;

    server.route({
        method: 'GET',
        path: '/users',
        handler: function(request, reply) {

            db.user.find((err, docs) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                reply(docs);
            });

        }
    });

    server.route({
        method: 'GET',
        path: '/users/{id}',
        handler: function(request, reply) {

            db.user.findOne({
                _id: request.params.id
            }, (err, doc) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (!doc) {
                    return reply(Boom.notFound());
                }

                reply(doc);
            });

        }
    });

    server.route({
        method: 'POST',
        path: '/users',
        handler: function(request, reply) {

                const book = request.payload.data;

                //Create an id
                //book._id = uuid.v1();

                db.user.save(book, (err, result) => {

                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }
                    var resp = {
                        status: "SUCCESS",
                        messages: "Signed up!",
                        data: book
                    }
                    reply(resp);
                });
            }
            /*,
                    config: {
                        validate: {
                            payload: {
                                title: Joi.string().min(10).max(50).required(),
                                author: Joi.string().min(10).max(50).required(),
                                isbn: Joi.number()
                            }
                        }
                    }*/
    });

    server.route({
        method: 'PATCH',
        path: '/users/{id}',
        handler: function(request, reply) {

            db.user.update({
                _id: request.params.id
            }, {
                $set: request.payload
            }, function(err, result) {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (result.n === 0) {
                    return reply(Boom.notFound());
                }

                reply().code(204);
            });
        },
        config: {
            validate: {
                payload: Joi.object({
                    title: Joi.string().min(10).max(50).optional(),
                    author: Joi.string().min(10).max(50).optional(),
                    isbn: Joi.number().optional()
                }).required().min(1)
            }
        }
    });

    server.route({
        method: 'DELETE',
        path: '/users/{id}',
        handler: function(request, reply) {

            db.user.remove({
                _id: request.params.id
            }, function(err, result) {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (result.n === 0) {
                    return reply(Boom.notFound());
                }

                reply().code(204);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/signin',
        handler: function(request, reply) {

            db.user.findOne({
                phone: request.payload.data.phone,
                password: request.payload.data.password
            }, (err, doc) => {
                var resp = {
                    status: "SUCCESS"
                };

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (!doc) {
                  resp.status = "ERROR",
                  resp.messages = "No auth";
                  //return reply(Boom.notFound());
                  return reply(resp);
                }

                reply(resp);
            });

        }
    });

    return next();
};

exports.register.attributes = {
    name: 'routes-users'
};
