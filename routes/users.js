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
        path: '/religious',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            const req = request.payload.data;

            db.users.update({
                _id: mongojs.ObjectId(req._id)
            }, {
                $set: {
                    religiousInfo: req.religiousInfo
                }
            }, function(err, result) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (result.n === 0) {
                    return reply(Boom.notFound());
                }

                resp.status = "SUCCESS";
                resp.messages = "Updated";
                reply(resp);
            });

        }
    });

    server.route({
        method: 'GET',
        path: '/religious/{id}',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };

            db.users.findOne({
                _id: mongojs.ObjectId(request.params.id)
            }, {
                religiousInfo: true
            }, function(err, doc) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                resp.status = "SUCCESS";

                if (!doc || !doc.religiousInfo) {
                    resp.messages = "No data found.";
                    return reply(resp);
                }

                resp.messages = "Data found.";
                resp.data.religiousInfo = doc.religiousInfo;
                reply(resp);
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/basicdetails/{id}',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };

            db.users.findOne({
                _id: mongojs.ObjectId(request.params.id)
            }, {
                basicDetails: true
            }, function(err, doc) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                resp.status = "SUCCESS";

                if (!doc || !doc.basicDetails) {
                    resp.messages = "No data found.";
                    return reply(resp);
                }

                resp.messages = "Data found.";
                resp.data.basicDetails = doc.basicDetails;
                reply(resp);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/basicdetails',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            const req = request.payload.data;

            req.basicDetails.dob = new Date(req.basicDetails.dob);
            db.users.update({
                _id: mongojs.ObjectId(req._id)
            }, {
                $set: {
                    basicDetails: req.basicDetails
                }
            }, function(err, result) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (result.n === 0) {
                    return reply(Boom.notFound());
                }

                resp.status = "SUCCESS";
                resp.messages = "Updated";
                return reply(resp);

                //reply().code(204);
            });

        }
    });

    server.route({
        method: 'GET',
        path: '/requestsout/{id}',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };

            db.users.findOne({
                _id: mongojs.ObjectId(request.params.id)
            }, {
                interestOut: true
            }, function(err, doc) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (!doc.interestOut || doc.interestOut.length === 0) {
                    resp.status = "SUCCESS";
                    resp.messages = "No requests.";
                    resp.data.profiles = [];
                    return reply(resp);
                }

                var queryObj = {};
                var interestOutIds = [];

                for (var i = 0; i < doc.interestOut.length; i++) {
                    interestOutIds.push(mongojs.ObjectId(doc.interestOut[i]));
                }
                queryObj._id = {
                    $in: interestOutIds
                };

                db.users.find(queryObj, {
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

    // Get requests
    server.route({
        method: 'GET',
        path: '/requestsin/{id}',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };

            db.users.findOne({
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

                db.users.find(queryObj, {
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
            db.users.findOne({
                phone: user.phone.phone
            }, {
                phone: true
            }, (err, doc) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                console.log("Phone update: " + util.inspect(doc, false, null));
                if (doc) {
                    resp.status = "ERROR";
                    resp.messages = "Mobile number is already registered.";
                    return reply(resp);
                }

                db.users.findOne({
                    _id: mongojs.ObjectId(user._id)
                }, {
                    phone: true
                }, (err, doc) => {
                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    if (doc.phone !== user.phone.oldPhone) {
                        resp.status = "ERROR";
                        resp.messages = "Wrong old mobile number.";
                        return reply(resp);
                    }

                    db.users.update({
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
                        resp.messages = "Mobile number updated.";
                        return reply(resp);

                        //reply().code(204);
                    });
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

            db.users.findOne({
                phone: user.phone,
            }, (err, doc) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (doc) {
                    resp.status = "ERROR";
                    resp.messages = "Phone number is already registered!";
                    return reply(resp);
                }

                db.users.findOne({
                    _id: mongojs.ObjectId(user._id)
                }, {
                    password: true
                }, (err, doc) => {
                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }
                    console.log("doc: " + doc.password);
                    if (doc.password !== user.password.oldPassword) {
                        resp.status = "ERROR";
                        resp.messages = "Wrong old password";
                        return reply(resp);
                    }

                    if (user.password.password !== user.password.rePassword) {
                        resp.status = "ERROR";
                        resp.messages = "New password mismatches";
                        return reply(resp);
                    }
                    // Update the password
                    db.users.update({
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
                    });
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
            db.users.update({
                _id: mongojs.ObjectId(user._id)
            }, {
                $pull: {
                    interestOut: user.id
                }
            }, function(err, result) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                console.log("result: " + result);

                db.users.update({
                    _id: mongojs.ObjectId(user.id)
                }, {
                    $pull: {
                        interestIn: user._id
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
            const req = request.payload.data;
            var queryObj = {
                $addToSet: {
                    interestOut: req.id
                }
            };

            if (req.isSlProfiles == true) {
                queryObj.$pull = {
                    shortlisted: req.id
                };
            }

            db.users.update({
                _id: mongojs.ObjectId(req._id)
            }, queryObj, function(err, result) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                console.log("result: " + util.inspect(result, false, null));

                db.users.update({
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
            db.users.update({
                _id: mongojs.ObjectId(user._id)
            }, {
                $pull: {
                    shortlisted: user.id
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
            db.users.update({
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

            db.users.findOne({
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

                db.users.find(queryObj, {
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
            var req = request.params;
            db.users.findOne({
                _id: mongojs.ObjectId(req.id)
            }, {
                shortlisted: true,
                interestOut: true,
                basicDetails: true
            }, (err, doc) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                console.log("doc: " + util.inspect(doc, false, null));
                var queryObj = {};
                var shortlistedIds = [];
                var interestOutIds = [];

                if (doc) {
                    if (doc.shortlisted !== undefined) {
                        for (var i = 0; i < doc.shortlisted.length; i++) {
                            shortlistedIds.push(mongojs.ObjectId(doc.shortlisted[i]));
                        }
                    }
                    console.log("shortlistedIds: " + util.inspect(shortlistedIds, false, null));

                    if (doc.interestOut !== undefined) {
                        for (var i = 0; i < doc.interestOut.length; i++) {
                            interestOutIds.push(mongojs.ObjectId(doc.interestOut[i]));
                        }
                    }
                    console.log("interestOutIds: " + util.inspect(interestOutIds, false, null));

                    queryObj = {
                        $and: [{
                            _id: {
                                $nin: shortlistedIds.concat(interestOutIds)
                            }
                        }, {
                            _id: {
                                $ne: mongojs.ObjectId(req.id)
                            }
                        }, {
                            "basicDetails.gender": {
                                    $ne: doc.basicDetails.gender
                                }

                        }]
                    };

                    /*queryObj._id = {
                        $nin: shortlistedIds.concat(interestOutIds)
                    };*/
                }

                db.users.find(queryObj, {
                    basicDetails: true,
                    userId: true,
                    dp: true
                }, (err, docs) => {

                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }
                    resp.status = "SUCCESS";
                    resp.data.profiles = docs;
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

            db.users.find({
                /*_id: {$not: { $eq: ObjectId('579ef8f69ad37c45d757f0a5')}}*/
            }, {
                fullName: true,
                userId: true
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
            var req = request.params;
            console.log("request.params.id:" + req.id);

            db.users.findOne({
                _id: mongojs.ObjectId(req.id)
            }, {
              basicDetails: true,
              religiousInfo: true,
              professionInfo: true,
              locationInfo: true,
              familyInfo: true,
              dp: true
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

    /*server.route({
        method: 'GET',
        path: '/users/{id}',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            console.log("request.params.id:" + request.params.id);
            db.users.findOne({
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
    });*/


    server.route({
        method: 'GET',
        path: '/users/search/{id}',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            var userId = request.params.id.toUpperCase();
            console.log("request.params.id:" + userId);
            db.users.findOne({
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

                var req = request.payload.data;

                db.users.findOne({
                    phone: req.phone,
                }, (err, doc) => {
                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    if (doc) {
                        resp.status = "ERROR";
                        resp.messages = "Phone number is already registered!";
                        return reply(resp);
                    }
                    req.basicDetails = {
                        fullName: req.fullName,
                        gender: req.gender
                    };

                    delete req.fullName;
                    delete req.gender;
                    delete req.rePassword;

                    req.userId = uuid.v4().substring(0, 8).toUpperCase();
                    req.createdAt = new Date();
                    req.updatedAt = new Date();
                    req.lastActive = new Date();
                    req.isActive = false;
                    req.isDeleted = false;
                    req.isVerified = false;
                    req.isPaid = false;
                    req.isCompleted = false;
                    req.isDP = false;

                    db.users.save(req, (err, result) => {
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
            db.users.update({
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
            db.users.remove({
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
            console.info("signin POST");
            var req = request.payload.data;
            var resp = {
                data: {}
            };
            db.users.findOne({
                phone: req.phone,
                password: req.password
            }, {
                phone: true,
                basicDetails: true,
                isDP: true
            }, (err, doc) => {
                if (err) {
                    console.error("err: " + util.inspect(err, false, null));
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                console.log("doc: " + util.inspect(doc, false, null));

                if (!doc) {
                    resp.status = "ERROR";
                    resp.messages = "No auth";
                    return reply(resp);
                }

                resp.status = "SUCCESS";
                resp.data = doc;

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
            db.users.findOne({
                phone: request.payload.data.phone,
            }, (err, doc) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (!doc) {
                    resp.status = "ERROR";
                    resp.messages = "No auth";
                    //return reply(Boom.notFound());
                    return reply(resp);
                }

                reply(resp);
            });

        }
    });

    server.route({
        method: 'GET',
        path: '/pinfo/{id}',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            db.users.findOne({
                _id: mongojs.ObjectId(request.params.id)
            }, {
                pinfo: true
            }, function(err, doc) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                resp.status = "SUCCESS";

                if (!doc || !doc.pinfo) {
                    resp.messages = "No data found.";
                    return reply(resp);
                }

                resp.messages = "Data found.";
                //console.log(util.inspect(doc, false, null));
                resp.data.pinfo = doc.pinfo;
                //resp.data.pinfo.dob = new Date(resp.data.pinfo.dob);
                return reply(resp);
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
            db.users.update({
                _id: mongojs.ObjectId(user._id)
            }, {
                $set: {
                    pinfo: user.pinfo
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
        path: '/location/{id}',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            var req = request.params;

            db.users.findOne({
                _id: mongojs.ObjectId(req.id)
            }, {
                locationInfo: true
            }, function(err, doc) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                resp.status = "SUCCESS";

                if (!doc.locationInfo) {
                    resp.messages = "No data found.";
                    return reply(resp);
                }

                resp.messages = "Data found.";
                //console.log(util.inspect(doc, false, null));
                resp.data.locationInfo = doc.locationInfo;
                reply(resp);
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
            var req = request.payload.data;
            db.users.update({
                _id: mongojs.ObjectId(req._id)
            }, {
                $set: {
                    locationInfo: req.locationInfo
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
        path: '/family/{id}',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            var req = request.params;

            db.users.findOne({
                _id: mongojs.ObjectId(req.id)
            }, {
                familyInfo: true
            }, function(err, doc) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                resp.status = "SUCCESS";

                if (!doc.familyInfo) {
                    resp.messages = "No family information.";
                    return reply(resp);
                }

                resp.messages = "Family information.";
                resp.data.familyInfo = doc.familyInfo;
                reply(resp);
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
            var req = request.payload.data;

            db.users.update({
                _id: mongojs.ObjectId(req._id)
            }, {
                $set: {
                    familyInfo: req.familyInfo
                }
            }, function(err, result) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (result.n === 0) {
                    return reply(Boom.notFound());
                }

                resp.status = "SUCCESS";
                resp.messages = "Updated family information.";
                reply(resp);
                //reply().code(204);
            });

        }
    });

    server.route({
        method: 'GET',
        path: '/profession/{id}',
        handler: function(request, reply) {
            var resp = {
                data: {}
            };
            var req = request.params;

            db.users.findOne({
                _id: mongojs.ObjectId(req.id)
            }, {
                professionInfo: true
            }, function(err, doc) {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                resp.status = "SUCCESS";

                if (!doc.professionInfo) {
                    resp.messages = "No data found.";
                    return reply(resp);
                }

                resp.messages = "Data found.";
                //console.log(util.inspect(doc, false, null));
                resp.data.professionInfo = doc.professionInfo;
                reply(resp);
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
            var req = request.payload.data;

            db.users.update({
                _id: mongojs.ObjectId(req._id)
            }, {
                $set: {
                    professionInfo: req.professionInfo
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
                reply(resp);
            });

        }
    });

    return next();
};

exports.register.attributes = {
    name: 'routes-users'
};
