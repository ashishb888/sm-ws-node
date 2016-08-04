'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const util = require('util');

exports.register = function(server, options, next) {

    const db = server.app.db;
    const mongojs = server.app.mongojs;

    // Get requests
    server.route({
        method: 'GET',
        path: '/requests/{id}',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };

            db.user.findOne({
                _id: mongojs.ObjectId(request.params.id)
            }, {
                interestIn: true
            }, function(err, doc) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (!doc.interestIn || doc.interestIn.length === 0) {
                  resp.status = "SUCCESS";
                  resp.messages = "No requests.";
                  resp.data.profiles = [];
                  return reply(resp);
                }

                var queryObj = {};
                var interestInIds = [];

                for (var i = 0; i < doc.interestIn.length; i++) {
                    interestInIds.push(mongojs.ObjectId(doc.interestIn[i]));
                }
                queryObj._id = {
                    $in: interestInIds
                };

                db.user.find(queryObj, {
                    fullName: true
                }, function(err, docs) {
                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    resp.status = "SUCCESS";
                    resp.messages = "Requests.";
                    resp.data.profiles = docs;
                    return reply(resp);

                    //reply().code(204);
                });
            });

        }
    });

    server.route({
        method: 'POST',
        path: '/phone',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            const user = request.payload.data;
            db.user.findOne({
                _id: mongojs.ObjectId(user._id)
            }, {
                phone: true
            }, (err, doc) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                console.log("doc.phone: " + doc.phone);

                if (doc.phone !== user.phone.oldPhone) {
                    resp.status = "ERROR",
                        resp.messages = "Wrong old mobile number.";
                    return reply(resp);
                }

                // Update the password
                db.user.update({
                    _id: mongojs.ObjectId(user._id)
                }, {
                    $set: {
                        phone: user.phone.phone
                    }
                }, function(err, result) {
                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }
                    resp.status = "SUCCESS";
                    resp.messages = "Mobile number updated";
                    return reply(resp);

                    //reply().code(204);
                });
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/password',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            const user = request.payload.data;
            db.user.findOne({
                _id: mongojs.ObjectId(user._id)
            }, {
                password: true
            }, (err, doc) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                console.log("doc: " + doc.password);
                if (doc.password !== user.password.oldPassword) {
                    resp.status = "ERROR",
                        resp.messages = "Wrong old password";
                    return reply(resp);
                }

                if (user.password.password !== user.password.rePassword) {
                    resp.status = "ERROR",
                        resp.messages = "New password mismatches";
                    return reply(resp);
                }
                // Update the password
                db.user.update({
                    _id: mongojs.ObjectId(user._id)
                }, {
                    $set: {
                        password: user.password.password
                    }
                }, function(err, result) {
                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    resp.status = "SUCCESS";
                    resp.messages = "Password updated";
                    return reply(resp);

                    //reply().code(204);
                });
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/disinterest',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            const user = request.payload.data;
            db.user.update({
                _id: mongojs.ObjectId(request.payload.data._id)
            }, {
                $pull: {
                    interestOut: request.payload.data.id
                }
            }, function(err, result) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                console.log("result: " + result);

                db.user.update({
                    _id: mongojs.ObjectId(request.payload.data.id)
                }, {
                    $pull: {
                        interestIn: request.payload.data._id
                    }
                }, function(err, result) {
                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    console.log("result: " + result);
                    resp.status = "SUCCESS";
                    resp.messages = "Interest reverted!";
                    resp.data = result;
                    return reply(resp);
                });
            });

        }
    });

    server.route({
        method: 'POST',
        path: '/interest',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            const user = request.payload.data;
            db.user.update({
                _id: mongojs.ObjectId(request.payload.data._id)
            }, {
                $addToSet: {
                    interestOut: request.payload.data.id
                }
            }, function(err, result) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                console.log("result: " + result);

                db.user.update({
                    _id: mongojs.ObjectId(request.payload.data.id)
                }, {
                    $addToSet: {
                        interestIn: request.payload.data._id
                    }
                }, function(err, result) {
                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    console.log("result: " + result);
                    resp.status = "SUCCESS";
                    resp.messages = "Interest shown!";
                    resp.data = result;
                    return reply(resp);
                });
            });

        }
    });

    server.route({
        method: 'POST',
        path: '/unshortlist',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            const user = request.payload.data;
            db.user.update({
                _id: mongojs.ObjectId(request.payload.data._id)
            }, {
                $pull: {
                    shortlisted: request.payload.data.id
                }
            }, function(err, result) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                console.log("result: " + result);
                /*if (result.n === 0) {
                  return reply(Boom.notFound());
                }*/
                resp.status = "SUCCESS";
                resp.messages = "Unshortlisted!";
                resp.data = result;
                return reply(resp);

                //reply().code(204);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/shortlist',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            const user = request.payload.data;
            db.user.update({
                _id: mongojs.ObjectId(user._id)
            }, {
                $addToSet: {
                    shortlisted: user.id
                }
            }, function(err, result) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                resp.status = "SUCCESS";
                resp.messages = "Shortlisted!";
                resp.data = result;
                return reply(resp);
            });

        }
    });

    // Get shortlist
    server.route({
        method: 'GET',
        path: '/shortlist/{id}',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };

            db.user.findOne({
                _id: mongojs.ObjectId(request.params.id)
            }, {
                shortlisted: true
            }, function(err, doc) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (!doc.shortlisted || doc.shortlisted.length === 0) {
                  resp.status = "SUCCESS";
                  resp.messages = "No requests.";
                  resp.data.profiles = [];
                  return reply(resp);
                }

                var queryObj = {};
                var shortlistedIds = [];

                for (var i = 0; i < doc.shortlisted.length; i++) {
                    shortlistedIds.push(mongojs.ObjectId(doc.shortlisted[i]));
                }
                queryObj._id = {
                    $in: shortlistedIds
                };

                /*var queryObj = {};
                var shortlistedIds = [];
                if (doc) {
                    if (doc.shortlisted === undefined || doc.shortlisted.length === 0) {
                        resp.status = "SUCCESS";
                        resp.messages = "No shortlisted profiles.";
                        return reply(resp);
                    }

                    for (var i = 0; i < doc.shortlisted.length; i++) {
                        shortlistedIds.push(mongojs.ObjectId(doc.shortlisted[i]));
                    }
                    queryObj._id = {
                        $in: shortlistedIds
                    };
                }*/

                db.user.find(queryObj, {
                    fullName: true
                }, function(err, docs) {
                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    resp.status = "SUCCESS";
                    resp.messages = "Shortlisted profiles.";
                    resp.data.profiles = docs;
                    return reply(resp);

                    //reply().code(204);
                });
            });

        }
    });

    // Get users
    // Need to change
    server.route({
        method: 'GET',
        path: '/userstoken/{id}',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };

            db.user.findOne({
                _id: mongojs.ObjectId(request.params.id)
            }, {
                shortlisted: true
            }, (err, doc) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                var queryObj = {};
                var shortlistedIds = [];

                if (doc) {
                    if (doc.shortlisted !== undefined) {
                        for (var i = 0; i < doc.shortlisted.length; i++) {
                            shortlistedIds.push(mongojs.ObjectId(doc.shortlisted[i]));
                        }
                        queryObj._id = {
                            $nin: shortlistedIds
                        };
                    }
                }

                db.user.find(queryObj, {
                    fullName: true
                }, (err, docs) => {

                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }
                    resp.status = "SUCCESS";
                    resp.data.profiles = docs;
                    console.log("NEW");
                    console.log(util.inspect(docs, false, null));
                    //console.log("NEW: %j", docs);
                    reply(resp);
                });
            });
        }
    });

    // Get users
    server.route({
        method: 'GET',
        path: '/users',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };

            db.user.find({
                /*_id: {$not: { $eq: ObjectId('579ef8f69ad37c45d757f0a5')}}*/
            }, {
                fullName: true
            }, (err, docs) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                resp.status = "SUCCESS";
                resp.data.profiles = docs;
                reply(resp);
            });

        }
    });

    server.route({
        method: 'GET',
        path: '/users/{id}',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            console.log("request.params.id:" + request.params.id);
            db.user.findOne({
                _id: mongojs.ObjectId(request.params.id)
            }, {
                gender: true,
                fullName: true,
                profession: true,
                family: true,
                location: true,
                pinfo: true
            }, (err, doc) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (!doc) {
                    return reply(Boom.notFound());
                }

                resp.status = "SUCCESS";
                resp.data.profile = doc;
                reply(resp);
            });

        }
    });


    server.route({
        method: 'GET',
        path: '/users/search/{id}',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            var userId = request.params.id.toUpperCase();
            console.log("request.params.id:" + userId);
            db.user.findOne({
                userId: userId
            }, (err, doc) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (!doc) {
                    return reply(Boom.notFound());
                }

                resp.status = "SUCCESS";
                resp.data.profile = doc;
                reply(resp);
            });

        }
    });


    server.route({
        method: 'POST',
        path: '/users',
        handler: function(request, reply) {
                var resp = {
                    data: {}
                };
                const user = request.payload.data;

                db.user.findOne({
                    phone: user.phone,
                }, (err, doc) => {
                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    if (doc) {
                        resp.status = "ERROR",
                            resp.messages = "Phone number is already registered!";
                        //return reply(Boom.notFound());
                        return reply(resp);
                    }

                    user.userId = uuid.v4().substring(0, 8).toUpperCase();
                    user.createdAt = new Date();
                    user.updatedAt = new Date();
                    user.lastActive = new Date();
                    user.isActive = false;
                    user.isDeleted = false;
                    user.isVerified = false;
                    db.user.save(user, (err, result) => {
                        if (err) {
                            return reply(Boom.wrap(err, 'Internal MongoDB error'));
                        }

                        resp.status = "SUCCESS";
                        resp.messages = "Signed up!";
                        reply(resp);
                    });
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
            var resp = {
                data: {}
            };
            db.user.update({
                _id: mongojs.ObjectId(request.params.id)
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
            var resp = {
                data: {}
            };
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
            var resp = {
                data: {}
            };
            db.user.findOne({
                phone: request.payload.data.phone,
                password: request.payload.data.password
            }, (err, doc) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (!doc) {
                    resp.status = "ERROR",
                        resp.messages = "No auth";
                    //return reply(Boom.notFound());
                    return reply(resp);
                }

                resp.status = "SUCCESS";
                resp.data = {
                    _id: doc._id,
                    phobe: doc.phone
                };

                reply(resp);
            });

        }
    });

    server.route({
        method: 'GET',
        path: '/personal',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            db.user.findOne({
                phone: request.payload.data.phone,
            }, (err, doc) => {
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

    server.route({
        method: 'POST',
        path: '/pinfo',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            const user = request.payload.data;
            user.pinfo.dob = new Date(user.pinfo.dob);
            db.user.update({
                _id: mongojs.ObjectId(user._id)
            }, {
                $set: {
                    pinfo: user.pinfo,
                    fullName: user.pinfo.fullName
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

    // Location
    server.route({
        method: 'POST',
        path: '/location',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            db.user.update({
                _id: mongojs.ObjectId(request.payload.data._id)
            }, {
                $set: {
                    location: request.payload.data.location
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

    // Family
    server.route({
        method: 'POST',
        path: '/family',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            db.user.update({
                _id: mongojs.ObjectId(request.payload.data._id)
            }, {
                $set: {
                    family: request.payload.data.family
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

    // Profession
    server.route({
        method: 'POST',
        path: '/profession',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            db.user.update({
                _id: mongojs.ObjectId(request.payload.data._id)
            }, {
                $set: {
                    profession: request.payload.data.profession
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

    return next();
};

exports.register.attributes = {
    name: 'routes-users'
};
