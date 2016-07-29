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

                const user = request.payload.data;

                //Create an id
                user._id = request.payload.data.phone;
                user.createdAt = new Date();
                user.updatedAt = new Date();
                user.lastActive = new Date();
                user.isActive = false;
                user.isDeleted = false;

                db.user.save(user, (err, result) => {

                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }
                    var resp = {
                        status: "SUCCESS",
                        messages: "Signed up!"
                            /*,
                                                    data: {
                                                      userId: user._id
                                                    }*/
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

                resp.data = {
                    userId: doc.phone
                };

                reply(resp);
            });

        }
    });

    server.route({
        method: 'GET',
        path: '/personal',
        handler: function(request, reply) {

            db.user.findOne({
                phone: request.payload.data.phone,
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

                resp.data = {
                    userId: doc.phone
                };

                reply(resp);
            });

        }
    });

    server.route({
        method: 'POST',
        path: '/pinfo',
        handler: function(request, reply) {

          const user = request.payload.data;

          //Create an id
          //user._id = request.payload.data.userId;

          db.user.update({
              _id: request.payload.data._id
          }, {
              $set: {pinfo: request.payload.data.pinfo, fullName: request.payload.data.pinfo.fullName}
          }, function(err, result) {
              var resp = {};
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

    // Location
    server.route({
        method: 'POST',
        path: '/location',
        handler: function(request, reply) {

          db.user.update({
              _id: request.payload.data._id
          }, {
              $set: {location: request.payload.data.location}
          }, function(err, result) {
              var resp = {};
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

    // Family
    server.route({
        method: 'POST',
        path: '/family',
        handler: function(request, reply) {

          db.user.update({
              _id: request.payload.data._id
          }, {
              $set: {family: request.payload.data.family}
          }, function(err, result) {
              var resp = {};
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

    // Professional
    server.route({
        method: 'POST',
        path: '/professional',
        handler: function(request, reply) {

          db.user.update({
              _id: request.payload.data._id
          }, {
              $set: {professional: request.payload.data.professional}
          }, function(err, result) {
              var resp = {};
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


    return next();
};

exports.register.attributes = {
    name: 'routes-users'
};
