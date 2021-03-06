'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const util = require('util');
var JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.register = function(server, options, next) {
  const db = server.app.db;
  const mongojs = server.app.mongojs;
  const moment = server.app.moment;
  const nPerPage = 5;
  const saltRounds = 10;

  server.route({
    method: 'POST',
    path: '/lastactive',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };
      var req = request.payload.data;

      db.users.update({
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, {
        $set: {
          lastActive: new Date()
        }
      }, function(err, doc) {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        resp.status = "SUCCESS";
        reply(resp);
      });
    }
  });

  // Get visitors
  server.route({
    method: 'GET',
    path: '/visitors/{page}',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };
      var page = request.params.page;
      var queryObj = {};

      db.users.findOne({
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, {
        viewedBy: true
      }, function(err, doc) {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        console.log("doc: " + util.inspect(doc, false, null));

        if (!doc.viewedBy || doc.viewedBy.length === 0) {
          resp.status = "SUCCESS";
          resp.messages = "No visitors.";
          resp.data.profiles = [];
          return reply(resp);
        }

        var viewedByIds = [];

        for (var i = 0; i < doc.viewedBy.length; i++) {
          viewedByIds.push(mongojs.ObjectId(doc.viewedBy[i]));
        }

        queryObj._id = {
          $in: viewedByIds
        };

        db.users.find(queryObj, {
          basicDetails: true,
          locationInfo: true,
          dp: true,
          userId: true
        }).sort({
          createdAt: -1
        }).limit(nPerPage).skip(page > 0 ? ((page - 1) * nPerPage) :
          0).toArray((err, docs) => {
          if (err) {
            return reply(Boom.wrap(err,
              'Internal MongoDB error'));
          }

          var docLength = docs.length;

          for (var i = 0; i < docLength; i++) {
            if (docs[i].basicDetails)
              if (docs[i].basicDetails
                .dob)
                docs[i].basicDetails.age = moment().diff(docs[i]
                  .basicDetails
                  .dob.toString(), "years");
          }

          resp.data.hasMore = true;

          if (docLength < nPerPage) {
            resp.data.hasMore = false;
            resp.messages = "You have visited all profiles.";
          }

          resp.status = "SUCCESS";
          resp.data.profiles = docs;
          reply(resp);
        });
      });
    }
  });

  // Get rejected
  server.route({
    method: 'GET',
    path: '/reject/{type}/{page}',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };
      var type = request.params.type;
      var page = request.params.page;
      var queryObj = {};
      queryObj[type] = true;

      db.users.findOne({
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, queryObj, function(err, doc) {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        if (!doc[type] || doc[type].length === 0) {
          resp.status = "SUCCESS";
          resp.messages = "No requests.";
          resp.data.profiles = [];
          return reply(resp);
        }

        queryObj = {};
        var typeIds = [];

        for (var i = 0; i < doc[type].length; i++) {
          typeIds.push(mongojs.ObjectId(doc[type][i]));
        }

        queryObj._id = {
          $in: typeIds
        };

        db.users.find(queryObj, {
          basicDetails: true,
          locationInfo: true,
          dp: true,
          userId: true
        }).sort({
          createdAt: -1
        }).limit(nPerPage).skip(page > 0 ? ((page - 1) * nPerPage) :
          0).toArray((err, docs) => {
          if (err) {
            return reply(Boom.wrap(err,
              'Internal MongoDB error'));
          }

          var docLength = docs.length;

          for (var i = 0; i < docLength; i++) {
            if (docs[i].basicDetails)
              if (docs[i].basicDetails
                .dob)
                docs[i].basicDetails.age = moment().diff(docs[i]
                  .basicDetails
                  .dob.toString(), "years");
          }

          resp.data.hasMore = true;

          if (docLength < nPerPage) {
            resp.data.hasMore = false;
            resp.messages = "You have visited all profiles.";
          }

          resp.status = "SUCCESS";
          resp.data.profiles = docs;
          reply(resp);
        });
      });
    }
  });

  // Get accepted
  server.route({
    method: 'GET',
    path: '/accept/{type}/{page}',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };

      var type = request.params.type;
      var page = request.params.page;
      var queryObj = {};
      queryObj[type] = true;

      console.log("queryObj: " + util.inspect(queryObj, false, null));
      db.users.findOne({
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, queryObj, function(err, doc) {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        if (!doc[type] || doc[type].length === 0) {
          resp.status = "SUCCESS";
          resp.messages = "No requests.";
          resp.data.profiles = [];
          return reply(resp);
        }

        queryObj = {};
        var typeIds = [];

        for (var i = 0; i < doc[type].length; i++) {
          typeIds.push(mongojs.ObjectId(doc[type][i]));
        }
        queryObj._id = {
          $in: typeIds
        };

        console.log("queryObj: " + util.inspect(queryObj, false,
          null));

        db.users.find(queryObj, {
          basicDetails: true,
          locationInfo: true,
          dp: true,
          userId: true
        }).sort({
          createdAt: -1
        }).limit(nPerPage).skip(page > 0 ? ((page - 1) * nPerPage) :
          0).toArray((err, docs) => {
          if (err) {
            return reply(Boom.wrap(err,
              'Internal MongoDB error'));
          }

          var docLength = docs.length;
          for (var i = 0; i < docLength; i++) {
            if (docs[i].basicDetails)
              if (docs[i].basicDetails
                .dob)
                docs[i].basicDetails.age = moment().diff(docs[i]
                  .basicDetails
                  .dob.toString(), "years");
          }

          resp.data.hasMore = true;

          if (docLength < nPerPage) {
            resp.data.hasMore = false;
            resp.messages = "You have visited all profiles.";
          }

          resp.status = "SUCCESS";
          resp.data.profiles = docs;
          reply(resp);
        });
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/reject',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };
      var req = request.payload.data;

      db.users.update({
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, {
        $addToSet: {
          rejectedOf: req.id
        },
        $pull: {
          interestIn: req.id
        }
      }, function(err, result) {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        db.users.update({
          _id: mongojs.ObjectId(req.id)
        }, {
          $addToSet: {
            rejectedBy: request.auth.credentials._id
          },
          $pull: {
            interestOut: request.auth.credentials._id
          }
        }, function(err, result) {
          if (err) {
            return reply(Boom.wrap(err,
              'Internal MongoDB error'));
          }

          resp.status = "SUCCESS";
          resp.messages = "Rejected.";
          resp.data = result;
          return reply(resp);
        });
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/accept',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };
      var req = request.payload.data;

      db.users.update({
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, {
        $addToSet: {
          acceptedOf: req.id
        },
        $pull: {
          interestIn: req.id
        }
      }, function(err, result) {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        db.users.update({
          _id: mongojs.ObjectId(req.id)
        }, {
          $addToSet: {
            acceptedBy: request.auth.credentials._id
          },
          $pull: {
            interestOut: request.auth.credentials._id,
            viewedBy: request.auth.credentials._id
          }
        }, function(err, result) {
          if (err) {
            return reply(Boom.wrap(err,
              'Internal MongoDB error'));
          }

          resp.status = "SUCCESS";
          resp.messages = "Accepted.";
          resp.data = result;
          return reply(resp);
        });
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/flags',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };

      db.users.findOne({
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, {
        isDP: true
      }, function(err, doc) {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        resp.status = "SUCCESS";
        resp.data = doc;
        reply(resp);
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/profilepreference',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };
      var req = request.payload.data;

      db.users.update({
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, {
        $set: {
          profilePreference: req.profilePreference
        },
        $addToSet: {
          profileProgress: "profilePreference"
        }
      }, function(err, result) {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        /*if (result.n === 0) {
          return reply(Boom.notFound());
        }*/

        resp.status = "SUCCESS";
        resp.messages = "Updated profile preference.";
        reply(resp);
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/filterprofiles',
    handler: function(request, reply) {
      var req = request.payload.data;
      console.log("req: " + util.inspect(req, false, null));
      var resp = {
        data: {}
      };
      var page = request.payload.page;
      console.log("page: " + page);
      var queryObj = {};
      var queryObjLocal = {};
      var isAllAny = true;

      db.users.findOne({
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, {
        shortlisted: true,
        basicDetails: true,
        interestOut: true,
        interestIn: true,
        acceptedBy: true,
        rejectedBy: true,
        acceptedOf: true,
        rejectedOf: true,
      }, (err, doc) => {

        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }
        console.log("doc: " + util.inspect(doc, false, null));
        var shortlistedIds = [];
        var interestOutIds = [];
        var interestInIds = [];
        var acceptedOfIds = [];
        var rejectedOfIds = [];
        var acceptedByIds = [];
        var rejectedByIds = [];

        if (doc) {
          if (doc.acceptedBy !== undefined) {
            for (var i = 0; i < doc.acceptedBy.length; i++) {
              acceptedByIds.push(mongojs.ObjectId(doc.acceptedBy[
                i]));
            }
          }
          console.log("acceptedByIds: " + util.inspect(
            acceptedByIds, false, null));

          if (doc.rejectedBy !== undefined) {
            for (var i = 0; i < doc.rejectedBy.length; i++) {
              rejectedByIds.push(mongojs.ObjectId(doc.rejectedBy[
                i]));
            }
          }
          console.log("rejectedByIds: " + util.inspect(
            rejectedByIds, false, null));


          if (doc.acceptedOf !== undefined) {
            for (var i = 0; i < doc.acceptedOf.length; i++) {
              acceptedOfIds.push(mongojs.ObjectId(doc.acceptedOf[
                i]));
            }
          }
          console.log("acceptedOfIds: " + util.inspect(
            acceptedOfIds, false, null));

          if (doc.rejectedOf !== undefined) {
            for (var i = 0; i < doc.rejectedOf.length; i++) {
              rejectedOfIds.push(mongojs.ObjectId(doc.rejectedOf[
                i]));
            }
          }
          console.log("interestInIds: " + util.inspect(
            interestInIds, false, null));

          if (doc.interestIn !== undefined) {
            for (var i = 0; i < doc.interestIn.length; i++) {
              interestInIds.push(mongojs.ObjectId(doc.interestIn[
                i]));
            }
          }
          console.log("interestInIds: " + util.inspect(
            interestInIds, false, null));

          if (doc.shortlisted !== undefined) {
            for (var i = 0; i < doc.shortlisted.length; i++) {
              shortlistedIds.push(mongojs.ObjectId(doc.shortlisted[
                i]));
            }
          }
          console.log("shortlistedIds: " + util.inspect(
            shortlistedIds, false, null));

          if (doc.interestOut !== undefined) {
            for (var i = 0; i < doc.interestOut.length; i++) {
              interestOutIds.push(mongojs.ObjectId(doc.interestOut[
                i]));
            }
          }
          console.log("interestOutIds: " + util.inspect(
            interestOutIds, false, null));

          queryObj.$and = [{
            _id: {
              $nin: shortlistedIds.concat(interestOutIds,
                acceptedOfIds, acceptedByIds, interestInIds,
                rejectedOfIds, rejectedByIds)
            }
          }, {
            _id: {
              $ne: mongojs.ObjectId(request.auth.credentials
                ._id)
            }
          }, {
            "basicDetails.gender": {
              $ne: doc.basicDetails.gender
            }
          }, {
            isCompleted: true
          }];
        }

        /*if (req.minAge.toLowerCase() != "any" || req.maxAge.toLowerCase() !=
          "any" || req.minHeight.toLowerCase() != "any" || req.maxHeight
          .toLowerCase() !=
          "any" || req.complexion.toLowerCase() != "any" || req.bodyType
          .toLowerCase() !=
          "any" || req.subCaste.toLowerCase() != "any") {
          //queryObj.basicDetails = {};
          isAllAny = false;
        }*/

        if (req.minAge.toLowerCase() != "any") {
          queryObjLocal["basicDetails.dob"] = {
            $lte: parseInt(moment(moment().subtract(parseInt(req.minAge),
              'years')._d).format('YYYYMMDD'))
          }

          queryObj.$and.push(queryObjLocal);
        }

        if (req.maxAge.toLowerCase() != "any") {
          queryObjLocal = {};
          queryObjLocal["basicDetails.dob"] = {
            $gte: parseInt(moment(moment().subtract(parseInt(req.maxAge) +
              1,
              'years')._d).format('YYYYMMDD'))
          }
          queryObj.$and.push(queryObjLocal);
        }
        //queryObjLocal.basicDetails.maxAge = req.maxAge;

        if (req.minHeight.toLowerCase() != "any") {
          var heightSplit = req.minHeight.split(" ");
          var feet = parseInt(heightSplit[0]);
          var inches = 0;

          if (heightSplit.length > 2) {
            inches = parseInt(heightSplit[2]);
          }

          queryObjLocal["basicDetails.height.feet"] = {
            $gte: feet
          };

          queryObjLocal["basicDetails.height.inches"] = {
            $gte: inches
          };

          queryObjLocal = {};
          queryObj.$and.push(queryObjLocal);
        }


        if (req.maxHeight.toLowerCase() != "any") {
          var heightSplit = req.maxHeight.split(" ");
          var feet = parseInt(heightSplit[0]);
          var inches = 0;

          if (heightSplit.length > 2) {
            inches = parseInt(heightSplit[2]);
          }

          queryObjLocal["basicDetails.height.feet"] = {
            $lte: feet
          };

          queryObjLocal["basicDetails.height.inches"] = {
            $lte: inches
          };

          queryObjLocal = {};
          queryObj.$and.push(queryObjLocal);
        }

        if (req.complexion.toLowerCase() != "any") {
          queryObjLocal = {};
          queryObjLocal["basicDetails.complexion"] = req.complexion;
          queryObj.$and.push(queryObjLocal);
        }

        if (req.bodyType.toLowerCase() != "any") {
          queryObjLocal = {};
          queryObjLocal["basicDetails.bodyType"] = req.bodyType;
          queryObj.$and.push(queryObjLocal);
        }


        if (req.subCaste.toLowerCase() != "any") {
          queryObjLocal = {};
          queryObjLocal["religiousInfo.subCaste"] = req.subCaste;
          queryObj.$and.push(queryObjLocal);
        }

        /*if (!isAllAny)
            queryObj.$and.push(queryObjLocal);*/


        console.log("queryObj: " + util.inspect(queryObj, false,
          null));

        db.users.find(queryObj, {
          basicDetails: true,
          userId: true,
          dp: true,
          locationInfo: true
        }).limit(nPerPage).skip(page > 0 ? ((page - 1) * nPerPage) :
          0).toArray((err, docs) => {
          if (err) {
            return reply(Boom.wrap(err,
              'Internal MongoDB error'));
          }

          var docLength = docs.length;
          console.log("docLength: " + docLength);
          console.log("page: " + page);

          for (var i = 0; i < docLength; i++) {
            if (docs[i].basicDetails)
              if (docs[i].basicDetails
                .dob)
                docs[i].basicDetails.age = moment().diff(docs[i]
                  .basicDetails
                  .dob.toString(), "years");
          }

          resp.data.hasMore = true;

          if (docLength < nPerPage) {
            resp.data.hasMore = false;
            resp.messages = "You have visited all profiles.";
          }

          resp.status = "SUCCESS";
          resp.data.profiles = docs;
          reply(resp);
        });
      });
    }
  });

  server.route({
    method: 'POST',
    path: '/otp',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };

      var req = request.payload.data;

      // Add OTP varification code
      resp.status = "SUCCESS";
      resp.messages = "Signed up!";
    }
  });

  server.route({
    method: 'POST',
    path: '/religious',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };
      var req = request.payload.data;
      delete req.religiousInfo.tobLocal;

      db.users.update({
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, {
        $set: {
          religiousInfo: req.religiousInfo
        },
        $addToSet: {
          profileProgress: "religiousInfo"
        }
      }, function(err, result) {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        if (result.n === 0) {
          return reply(Boom.notFound());
        }

        resp.status = "SUCCESS";
        resp.messages = "Updated religious information.";
        reply(resp);
      });

    }
  });

  server.route({
    method: 'GET',
    path: '/religious',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };

      db.users.findOne({
        _id: mongojs.ObjectId(request.auth.credentials._id)
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
    path: '/basicdetails',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };

      db.users.findOne({
        _id: mongojs.ObjectId(request.auth.credentials._id)
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
      var req = request.payload.data;
      delete req.dobLocal;
      delete req.age;
      //req.basicDetails.dob = new Date(req.basicDetails.dob);
      db.users.update({
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, {
        $set: {
          basicDetails: req.basicDetails
        },
        $addToSet: {
          profileProgress: "basicDetails"
        }
      }, function(err, result) {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        if (result.n === 0) {
          return reply(Boom.notFound());
        }

        resp.status = "SUCCESS";
        resp.messages = "Updated basic details.";
        return reply(resp);

        //reply().code(204);
      });

    }
  });

  server.route({
    method: 'GET',
    path: '/requestsout/{page}',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };
      var page = request.params.page;

      db.users.findOne({
        _id: mongojs.ObjectId(request.auth.credentials._id)
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
          basicDetails: true,
          dp: true,
          locationInfo: true,
          userId: true
        }).sort({
          createdAt: -1
        }).limit(nPerPage).skip(page > 0 ? ((page - 1) * nPerPage) :
          0).toArray((err, docs) => {
          if (err) {
            return reply(Boom.wrap(err,
              'Internal MongoDB error'));
          }

          var docLength = docs.length;

          for (var i = 0; i < docLength; i++) {
            if (docs[i].basicDetails)
              if (docs[i].basicDetails
                .dob)
                docs[i].basicDetails.age = moment().diff(docs[i]
                  .basicDetails
                  .dob.toString(), "years");
          }

          resp.data.hasMore = true;

          if (docLength < nPerPage) {
            resp.data.hasMore = false;
            resp.messages = "You have visited all profiles.";
          }

          resp.status = "SUCCESS";
          resp.data.profiles = docs;
          return reply(resp);
        });
      });
    }
  });

  // Get requests
  server.route({
    method: 'GET',
    path: '/requestsin/{page}',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };
      var page = request.params.page;

      db.users.findOne({
        _id: mongojs.ObjectId(request.auth.credentials._id)
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
          basicDetails: true,
          dp: true,
          locationInfo: true,
          userId: true
        }).sort({
          createdAt: -1
        }).limit(nPerPage).skip(page > 0 ? ((page - 1) * nPerPage) :
          0).toArray((err, docs) => {
          if (err) {
            return reply(Boom.wrap(err,
              'Internal MongoDB error'));
          }

          var docLength = docs.length;

          for (var i = 0; i < docLength; i++) {
            if (docs[i].basicDetails)
              if (docs[i].basicDetails
                .dob)
                docs[i].basicDetails.age = moment().diff(docs[i]
                  .basicDetails
                  .dob.toString(), "years");
          }

          resp.data.hasMore = true;

          if (docLength < nPerPage) {
            resp.data.hasMore = false;
            resp.messages = "You have visited all profiles.";
          }

          resp.status = "SUCCESS";
          resp.data.profiles = docs;
          return reply(resp);
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

      var user = request.payload.data;

      db.users.findOne({
        phone: user.phone.phone
      }, {
        phone: true
      }, (err, doc) => {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }
        console.log("Phone update: " + util.inspect(doc, false,
          null));
        if (doc) {
          resp.status = "ERROR";
          resp.messages = "Mobile number is already registered.";
          return reply(resp);
        }

        db.users.findOne({
          _id: mongojs.ObjectId(request.auth.credentials._id)
        }, {
          phone: true
        }, (err, doc) => {
          if (err) {
            return reply(Boom.wrap(err,
              'Internal MongoDB error'));
          }

          if (doc.phone !== user.phone.oldPhone) {
            resp.status = "ERROR";
            resp.messages = "Wrong old mobile number.";
            return reply(resp);
          }

          db.users.update({
            _id: mongojs.ObjectId(request.auth.credentials._id)
          }, {
            $set: {
              phone: user.phone.phone
            }
          }, function(err, result) {
            if (err) {
              return reply(Boom.wrap(err,
                'Internal MongoDB error'));
            }

            resp.status = "SUCCESS";
            resp.messages = "Mobile number updated.";
            return reply(resp);
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

      var user = request.payload.data;

      if (user.password.password !== user.password.rePassword) {
        resp.status = "ERROR";
        resp.messages = "New password mismatches";
        return reply(resp);
      }

      db.users.findOne({
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, {
        password: true
      }, (err, doc) => {
        if (err) {
          return reply(Boom.wrap(err,
            'Internal MongoDB error'));
        }
        console.log("doc: " + doc.password);

        bcrypt.compare(user.password.oldPassword, doc.password,
          function(err, isMatch) {
            if (!isMatch) {
              resp.status = "ERROR";
              resp.messages = "Wrong old password";
              return reply(resp);
            }

            // Update the password
            bcrypt.hash(user.password.password, saltRounds,
              function(err, hashPassword) {
                if (err) {
                  console.log("err: " + err);
                }

                db.users.update({
                  _id: mongojs.ObjectId(request.auth.credentials
                    ._id)
                }, {
                  $set: {
                    password: hashPassword
                  }
                }, function(err, result) {
                  if (err) {
                    return reply(Boom.wrap(err,
                      'Internal MongoDB error'));
                  }

                  resp.status = "SUCCESS";
                  resp.messages = "Password updated";
                  return reply(resp);
                });
              });
          });

        /*if (doc.password !== user.password.oldPassword) {
          resp.status = "ERROR";
          resp.messages = "Wrong old password";
          return reply(resp);
        }*/
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

      var user = request.payload.data;

      db.users.update({
        _id: mongojs.ObjectId(request.auth.credentials._id)
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
            interestIn: request.auth.credentials._id
          },
          $addToSet: {
            viewedBy: request.auth.credentials._id
          }
        }, function(err, result) {
          if (err) {
            return reply(Boom.wrap(err,
              'Internal MongoDB error'));
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
        }
      }

      console.log("queryObj: " + util.inspect(queryObj, false, null));

      db.users.update({
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, queryObj, function(err, result) {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        console.log("result: " + util.inspect(result, false, null));

        /*queryObj = {
          $addToSet: {
            interestOut: req.id
          },
          $pull: {
          }
        };

        queryObj.$pull.viewedBy = req.id;*/
        db.users.update({
          _id: mongojs.ObjectId(req.id)
        }, {
          $addToSet: {
            interestIn: request.auth.credentials._id
          },
          $pull: {
            viewedBy: request.auth.credentials._id,
            shortlisted: request.auth.credentials._id
          }
        }, function(err, result) {
          if (err) {
            return reply(Boom.wrap(err,
              'Internal MongoDB error'));
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
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, {
        $pull: {
          shortlisted: user.id
        }
      }, function(err, result) {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        db.users.update({
          _id: mongojs.ObjectId(user.id)
        }, {
          $addToSet: {
            viewedBy: request.auth.credentials._id
          }
        }, function(err, result) {
          if (err) {
            return reply(Boom.wrap(err,
              'Internal MongoDB error'));
          }

          resp.status = "SUCCESS";
          resp.messages = "Unshortlisted";
          resp.data = result;
          return reply(resp);
        });
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
        _id: mongojs.ObjectId(request.auth.credentials._id)
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
    path: '/shortlist/{page}',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };
      var page = request.params.page;

      db.users.findOne({
        _id: mongojs.ObjectId(request.auth.credentials._id)
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
          basicDetails: true,
          locationInfo: true,
          dp: true,
          userId: true
        }).limit(nPerPage).skip(page > 0 ? ((page - 1) * nPerPage) :
          0).toArray(function(err, docs) {
          if (err) {
            return reply(Boom.wrap(err,
              'Internal MongoDB error'));
          }

          var docLength = docs.length;

          for (var i = 0; i < docLength; i++) {
            if (docs[i].basicDetails)
              if (docs[i].basicDetails
                .dob)
                docs[i].basicDetails.age = moment().diff(docs[i]
                  .basicDetails
                  .dob.toString(), "years");
          }

          resp.data.hasMore = true;

          if (docLength < nPerPage) {
            resp.data.hasMore = false;
            resp.messages = "You have visited all profiles.";
          }

          resp.status = "SUCCESS";
          resp.data.profiles = docs;
          reply(resp);
        });
      });
    }
  });

  // Get users
  server.route({
    method: 'GET',
    path: '/users/paginate/{page}',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };
      var page = request.params.page;

      console.log("request.auth.credentials: " + util.inspect(
        request.auth.credentials, false, null));

      db.users.findOne({
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, {
        shortlisted: true,
        interestOut: true,
        interestIn: true,
        acceptedBy: true,
        rejectedBy: true,
        acceptedOf: true,
        rejectedOf: true,
        viewedBy: true,
        basicDetails: true,
        profilePreference: true,
        isCompleted: true
      }, (err, doc) => {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        console.log("doc: " + util.inspect(doc, false, null));

        var queryObj = {};
        var queryObjLocal = {};
        var shortlistedIds = [];
        var interestOutIds = [];
        var acceptedByIds = [];
        var rejectedByIds = [];
        var acceptedOfIds = [];
        var rejectedOfIds = [];
        var interestInIds = [];
        var viewedByIds = [];

        if (doc) {
          if (!doc.isCompleted) {
            resp.status = "ERROR";
            resp.messages =
              "Complete your profile to see other profiles.";
            //console.log("NEW: %j", docs);
            return reply(resp);
          }

          if (doc.viewedBy) {
            for (var i = 0, len = doc.viewedBy.length; i < len; i++) {
              viewedByIds.push(mongojs.ObjectId(doc.viewedBy[i]));
            }
          }
          console.log("viewedByIds: " + util.inspect(
            viewedByIds, false, null));

          if (doc.acceptedOf !== undefined) {
            for (var i = 0, len = doc.acceptedOf.length; i < len; i++) {
              acceptedOfIds.push(mongojs.ObjectId(doc.acceptedOf[
                i]));
            }
          }
          console.log("acceptedOfIds: " + util.inspect(
            acceptedOfIds, false, null));

          if (doc.rejectedOf !== undefined) {
            for (var i = 0; i < doc.rejectedOf.length; i++) {
              rejectedOfIds.push(mongojs.ObjectId(doc.rejectedOf[
                i]));
            }
          }
          console.log("rejectedOfIds: " + util.inspect(
            rejectedOfIds, false, null));

          if (doc.interestIn !== undefined) {
            for (var i = 0; i < doc.interestIn.length; i++) {
              interestInIds.push(mongojs.ObjectId(doc.interestIn[
                i]));
            }
          }
          console.log("interestInIds: " + util.inspect(
            interestInIds, false, null));

          if (doc.rejectedBy !== undefined) {
            for (var i = 0; i < doc.rejectedBy.length; i++) {
              rejectedByIds.push(mongojs.ObjectId(doc.rejectedBy[
                i]));
            }
          }
          console.log("rejectedByIds: " + util.inspect(
            rejectedByIds, false, null));

          if (doc.acceptedBy !== undefined) {
            for (var i = 0; i < doc.acceptedBy.length; i++) {
              acceptedByIds.push(mongojs.ObjectId(doc.acceptedBy[
                i]));
            }
          }
          console.log("acceptedByIds: " + util.inspect(
            acceptedByIds, false, null));

          if (doc.shortlisted !== undefined) {
            for (var i = 0; i < doc.shortlisted.length; i++) {
              shortlistedIds.push(mongojs.ObjectId(doc.shortlisted[
                i]));
            }
          }
          console.log("shortlistedIds: " + util.inspect(
            shortlistedIds, false, null));

          if (doc.interestOut !== undefined) {
            for (var i = 0; i < doc.interestOut.length; i++) {
              interestOutIds.push(mongojs.ObjectId(doc.interestOut[
                i]));
            }
          }
          console.log("interestOutIds: " + util.inspect(
            interestOutIds, false, null));

          queryObj = {
            $and: [{
              _id: {
                $nin: shortlistedIds.concat(interestOutIds,
                  interestInIds, acceptedByIds,
                  rejectedByIds, acceptedOfIds,
                  rejectedOfIds, viewedByIds)
              }
            }, {
              _id: {
                $ne: mongojs.ObjectId(request.auth.credentials
                  ._id)
              }
            }, {
              "basicDetails.gender": {
                $ne: doc.basicDetails.gender
              }
            }, {
              isCompleted: true
            }]
          };

          if (doc.profilePreference !== undefined) {
            var preference = doc.profilePreference;

            if (preference.minAge.toLowerCase() != "any") {
              queryObjLocal["basicDetails.dob"] = {
                $lte: parseInt(moment(moment().subtract(parseInt(
                    preference.minAge),
                  'years')._d).format('YYYYMMDD'))
              }

              queryObj.$and.push(queryObjLocal);
            }

            if (preference.maxAge.toLowerCase() != "any") {
              queryObjLocal = {};
              queryObjLocal["basicDetails.dob"] = {
                $gte: parseInt(moment(moment().subtract(parseInt(
                    preference.maxAge) + 1,
                  'years')._d).format('YYYYMMDD'))
              }
              queryObj.$and.push(queryObjLocal);
            }
            //queryObjLocal.basicDetails.maxAge = preference.maxAge;

            if (preference.minHeight.toLowerCase() != "any") {
              var heightSplit = preference.minHeight.split(" ");
              var feet = parseInt(heightSplit[0]);
              var inches = 0;

              if (heightSplit.length > 2) {
                inches = parseInt(heightSplit[2]);
              }

              queryObjLocal["basicDetails.height.feet"] = {
                $gte: feet
              };

              queryObjLocal["basicDetails.height.inches"] = {
                $gte: inches
              };

              queryObjLocal = {};
              queryObj.$and.push(queryObjLocal);
            }


            if (preference.maxHeight.toLowerCase() != "any") {
              var heightSplit = preference.maxHeight.split(" ");
              var feet = parseInt(heightSplit[0]);
              var inches = 0;

              if (heightSplit.length > 2) {
                inches = parseInt(heightSplit[2]);
              }

              queryObjLocal["basicDetails.height.feet"] = {
                $lte: feet
              };

              queryObjLocal["basicDetails.height.inches"] = {
                $lte: inches
              };

              queryObjLocal = {};
              queryObj.$and.push(queryObjLocal);
            }

            if (preference.complexion.toLowerCase() != "any") {
              queryObjLocal = {};
              queryObjLocal["basicDetails.complexion"] = preference
                .complexion;
              queryObj.$and.push(queryObjLocal);
            }

            if (preference.bodyType.toLowerCase() != "any") {
              queryObjLocal = {};
              queryObjLocal["basicDetails.bodyType"] = preference.bodyType;
              queryObj.$and.push(queryObjLocal);
            }


            if (preference.subCaste.toLowerCase() != "any") {
              queryObjLocal = {};
              queryObjLocal["religiousInfo.subCaste"] = preference.subCaste;
              queryObj.$and.push(queryObjLocal);
            }
          }
        }

        db.users.find(queryObj, {
          basicDetails: true,
          userId: true,
          dp: true,
          locationInfo: true
        }).sort({
          createdAt: -1
        }).limit(nPerPage).skip(page > 0 ? ((page - 1) * nPerPage) :
          0).toArray((err, docs) => {
          if (err) {
            return reply(Boom.wrap(err,
              'Internal MongoDB error'));
          }

          var docLength = docs.length;

          for (var i = 0; i < docLength; i++) {
            if (docs[i].basicDetails)
              if (docs[i].basicDetails.dob)
                docs[i].basicDetails.age = moment().diff(docs[i]
                  .basicDetails.dob.toString(), "years");
          }

          resp.data.hasMore = true;

          if (docLength < nPerPage) {
            resp.data.hasMore = false;
            resp.messages = "You have visited all profiles.";
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

      console.log("request.auth.credentials: " + util.inspect(
        request.auth.credentials, false, null));

      db.users.findOne({
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, {
        shortlisted: true,
        interestOut: true,
        interestIn: true,
        acceptedBy: true,
        rejectedBy: true,
        acceptedOf: true,
        rejectedOf: true,
        basicDetails: true,
        profilePreference: true,
        isCompleted: true
      }, (err, doc) => {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        console.log("doc: " + util.inspect(doc, false, null));

        var queryObj = {};
        var queryObjLocal = {};
        var shortlistedIds = [];
        var interestOutIds = [];
        var acceptedByIds = [];
        var rejectedByIds = [];
        var acceptedOfIds = [];
        var rejectedOfIds = [];
        var interestInIds = [];

        if (doc) {
          if (!doc.isCompleted) {
            resp.status = "ERROR";
            resp.messages =
              "Complete your profile to see other profiles.";
            //console.log("NEW: %j", docs);
            return reply(resp);
          }

          if (doc.acceptedOf !== undefined) {
            for (var i = 0; i < doc.acceptedOf.length; i++) {
              acceptedOfIds.push(mongojs.ObjectId(doc.acceptedOf[
                i]));
            }
          }
          console.log("acceptedOfIds: " + util.inspect(
            acceptedOfIds, false, null));

          if (doc.rejectedOf !== undefined) {
            for (var i = 0; i < doc.rejectedOf.length; i++) {
              rejectedOfIds.push(mongojs.ObjectId(doc.rejectedOf[
                i]));
            }
          }
          console.log("rejectedOfIds: " + util.inspect(
            rejectedOfIds, false, null));

          if (doc.interestIn !== undefined) {
            for (var i = 0; i < doc.interestIn.length; i++) {
              interestInIds.push(mongojs.ObjectId(doc.interestIn[
                i]));
            }
          }
          console.log("interestInIds: " + util.inspect(
            interestInIds, false, null));

          if (doc.rejectedBy !== undefined) {
            for (var i = 0; i < doc.rejectedBy.length; i++) {
              rejectedByIds.push(mongojs.ObjectId(doc.rejectedBy[
                i]));
            }
          }
          console.log("rejectedByIds: " + util.inspect(
            rejectedByIds, false, null));

          if (doc.acceptedBy !== undefined) {
            for (var i = 0; i < doc.acceptedBy.length; i++) {
              acceptedByIds.push(mongojs.ObjectId(doc.acceptedBy[
                i]));
            }
          }
          console.log("acceptedByIds: " + util.inspect(
            acceptedByIds, false, null));

          if (doc.shortlisted !== undefined) {
            for (var i = 0; i < doc.shortlisted.length; i++) {
              shortlistedIds.push(mongojs.ObjectId(doc.shortlisted[
                i]));
            }
          }
          console.log("shortlistedIds: " + util.inspect(
            shortlistedIds, false, null));

          if (doc.interestOut !== undefined) {
            for (var i = 0; i < doc.interestOut.length; i++) {
              interestOutIds.push(mongojs.ObjectId(doc.interestOut[
                i]));
            }
          }
          console.log("interestOutIds: " + util.inspect(
            interestOutIds, false, null));

          queryObj = {
            $and: [{
              _id: {
                $nin: shortlistedIds.concat(interestOutIds,
                  interestInIds, acceptedByIds,
                  rejectedByIds, acceptedOfIds,
                  rejectedOfIds)
              }
            }, {
              _id: {
                $ne: mongojs.ObjectId(request.auth.credentials
                  ._id)
              }
            }, {
              "basicDetails.gender": {
                $ne: doc.basicDetails.gender
              }
            }, {
              isCompleted: true
            }]
          };

          if (doc.profilePreference !== undefined) {
            var preference = doc.profilePreference;

            if (preference.minAge.toLowerCase() != "any") {
              queryObjLocal["basicDetails.dob"] = {
                $lte: parseInt(moment(moment().subtract(parseInt(
                    preference.minAge),
                  'years')._d).format('YYYYMMDD'))
              }

              queryObj.$and.push(queryObjLocal);
            }

            if (preference.maxAge.toLowerCase() != "any") {
              queryObjLocal = {};
              queryObjLocal["basicDetails.dob"] = {
                $gte: parseInt(moment(moment().subtract(parseInt(
                    preference.maxAge) + 1,
                  'years')._d).format('YYYYMMDD'))
              }
              queryObj.$and.push(queryObjLocal);
            }
            //queryObjLocal.basicDetails.maxAge = preference.maxAge;

            if (preference.minHeight.toLowerCase() != "any") {
              var heightSplit = preference.minHeight.split(" ");
              var feet = parseInt(heightSplit[0]);
              var inches = 0;

              if (heightSplit.length > 2) {
                inches = parseInt(heightSplit[2]);
              }

              queryObjLocal["basicDetails.height.feet"] = {
                $gte: feet
              };

              queryObjLocal["basicDetails.height.inches"] = {
                $gte: inches
              };

              queryObjLocal = {};
              queryObj.$and.push(queryObjLocal);
            }


            if (preference.maxHeight.toLowerCase() != "any") {
              var heightSplit = preference.maxHeight.split(" ");
              var feet = parseInt(heightSplit[0]);
              var inches = 0;

              if (heightSplit.length > 2) {
                inches = parseInt(heightSplit[2]);
              }

              queryObjLocal["basicDetails.height.feet"] = {
                $lte: feet
              };

              queryObjLocal["basicDetails.height.inches"] = {
                $lte: inches
              };

              queryObjLocal = {};
              queryObj.$and.push(queryObjLocal);
            }

            if (preference.complexion.toLowerCase() != "any") {
              queryObjLocal = {};
              queryObjLocal["basicDetails.complexion"] = preference
                .complexion;
              queryObj.$and.push(queryObjLocal);
            }

            if (preference.bodyType.toLowerCase() != "any") {
              queryObjLocal = {};
              queryObjLocal["basicDetails.bodyType"] = preference.bodyType;
              queryObj.$and.push(queryObjLocal);
            }


            if (preference.subCaste.toLowerCase() != "any") {
              queryObjLocal = {};
              queryObjLocal["religiousInfo.subCaste"] = preference.subCaste;
              queryObj.$and.push(queryObjLocal);
            }
          }
        }

        db.users.find(queryObj, {
          basicDetails: true,
          userId: true,
          dp: true,
          locationInfo: true
        }, (err, docs) => {

          if (err) {
            return reply(Boom.wrap(err,
              'Internal MongoDB error'));
          }

          for (var i = 0, len = docs.length; i < len; i++) {
            if (docs[i].basicDetails)
              if (docs[i].basicDetails.dob)
                docs[i].basicDetails.age = moment().diff(docs[i]
                  .basicDetails.dob.toString(), "years");
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
  /*server.route({
    method: 'GET',
    path: '/users',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };

      db.users.find({
        //_id: {$not: { $eq: ObjectId('579ef8f69ad37c45d757f0a5')}}
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
  });*/

  server.route({
    method: 'GET',
    path: '/users/{id}/{view?}',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };
      var req = request.params;
      console.log("request.params.id:" + req.id);
      console.log("request.params.view:" + req.view);

      db.users.findOne({
        _id: mongojs.ObjectId(req.id)
      }, {
        basicDetails: true,
        religiousInfo: true,
        professionInfo: true,
        locationInfo: true,
        familyInfo: true,
        dp: true,
        userId: true,
        profilePreference: true
      }, (err, doc) => {

        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        if (!doc) {
          return reply(Boom.notFound());
        }

        if (req.view) {
          console.log("viewedBy true");

          db.users.update({
            _id: mongojs.ObjectId(req.id)
          }, {
            $addToSet: {
              viewedBy: request.auth.credentials
                ._id
            }
          }, function(err, doc) {
            if (err) {
              return reply(Boom.wrap(err,
                'Internal MongoDB error'));
            }
          });
        }

        if (doc.basicDetails) {
          if (doc.basicDetails.dob)
            doc.basicDetails.age = moment().diff(doc.basicDetails.dob
              .toString(), "years");
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
      }, {
        basicDetails: true,
        dp: true,
        userId: true,
        religiousInfo: true,
        professionInfo: true,
        locationInfo: true,
        familyInfo: true
      }, (err, doc) => {

        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        if (!doc) {
          resp.status = "ERROR";
          resp.messages = "Not found";
          return reply(resp);
        }
        if (doc.basicDetails)
          doc.basicDetails.age = moment().diff(doc.basicDetails.dob,
            "years");

        resp.status = "SUCCESS";
        resp.data.profile = doc;
        reply(resp);
      });

    }
  });

  server.route({
    method: 'POST',
    config: {
      auth: false
    },
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
          req.profileProgress = [];

          bcrypt.hash(req.password, saltRounds, function(err, hash) {
            if (err) {
              console.log("err: " + err);
            }

            req.password = hash;

            db.users.save(req, (err, doc) => {
              if (err) {
                return reply(Boom.wrap(err,
                  'Internal MongoDB error'));
              }

              var token = {
                _id: doc._id,
                gender: doc.basicDetails.gender
                  /*exp: new Date().getTime() + 1 * 60 * 1000 // expires in 30 minutes time*/
              }

              // sign the session as a JWT
              // var signedToken = JWT.sign(token, process.env.JWT_SECRET); // synchronous
              var signedToken = JWT.sign(token,
                "NeverShareYourSecret", {
                  algorithm: server.app.jwtToken.algorithm,
                  expiresIn: server.app.jwtToken.expiresIn
                }); // synchronous

              console.log("signedToken: " + signedToken);

              resp.status = "SUCCESS";
              resp.token = signedToken;
              resp.data = doc;
              resp.messages = "Signed up!";
              reply(resp)
                .header("Authorization", signedToken);
            });
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
    config: {
      auth: false
    },
    handler: function(request, reply) {
      console.info("signin POST");
      var req = request.payload.data;
      console.log("req: " + util.inspect(req, false, null));
      var resp = {
        data: {}
      };

      db.users.findOne({
        phone: req.phone
      }, {
        password: true,
        phone: true,
        basicDetails: true,
        isDP: true,
        dp: true,
        userId: true,
        locationInfo: true
      }, (err, doc) => {
        if (err) {
          console.error("err: " + util.inspect(err, false, null));
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        console.log("doc: " + util.inspect(doc, false, null));

        if (!doc) {
          resp.status = "ERROR";
          resp.messages = "Incorrect credentials";
          return reply(resp);
        }

        bcrypt.compare(req.password, doc.password, function(err,
          isMatch) {
          if (isMatch !== true) {
            resp.status = "ERROR";
            resp.messages = "Incorrect credentials";
            return reply(resp);
          }

          var token = {
            _id: doc._id,
            gender: doc.gender
              /*,
                          exp: new Date().getTime() + 1 * 60 * 1000 // expires in 30 minutes time*/
          }

          // sign the session as a JWT
          // var signedToken = JWT.sign(token, process.env.JWT_SECRET); // synchronous
          var signedToken = JWT.sign(token,
            "NeverShareYourSecret", {
              algorithm: server.app.jwtToken.algorithm,
              expiresIn: server.app.jwtToken.expiresIn
            }); // synchronous

          console.log("signedToken: " + signedToken);
          resp.status = "SUCCESS";
          resp.token = signedToken;
          resp.data = doc;
          reply(resp)
            .header("Authorization", signedToken);
        });
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

        resp.data.pinfo = doc.pinfo;
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

        resp.status = "SUCCESS";
        resp.messages = "Added";
        reply(resp);
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/location',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };
      var req = request.params;

      db.users.findOne({
        _id: mongojs.ObjectId(request.auth.credentials._id)
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
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, {
        $set: {
          locationInfo: req.locationInfo
        },
        $addToSet: {
          profileProgress: "locationInfo"
        }
      }, function(err, result) {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        /*if (result.n === 0) {
          return reply(Boom.notFound());
        }*/

        resp.status = "SUCCESS";
        resp.messages = "Updated location information.";
        reply(resp);
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/family',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };
      var req = request.params;

      db.users.findOne({
        _id: mongojs.ObjectId(request.auth.credentials._id)
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
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, {
        $set: {
          familyInfo: req.familyInfo,
          isCompleted: true
        },
        $addToSet: {
          profileProgress: "familyInfo"
        }
      }, function(err, doc) {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        /*if (doc.n === 0) {
          return reply(Boom.notFound());
        }*/

        resp.status = "SUCCESS";
        resp.messages = "Updated family information.";
        reply(resp);
        //reply().code(204);
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/profession',
    handler: function(request, reply) {
      var resp = {
        data: {}
      };
      var req = request.params;

      db.users.findOne({
        _id: mongojs.ObjectId(request.auth.credentials._id)
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
        _id: mongojs.ObjectId(request.auth.credentials._id)
      }, {
        $set: {
          professionInfo: req.professionInfo
        },
        $addToSet: {
          profileProgress: "professionInfo"
        }
      }, function(err, result) {
        if (err) {
          return reply(Boom.wrap(err, 'Internal MongoDB error'));
        }

        resp.status = "SUCCESS";
        resp.messages = "Updated profession information";
        reply(resp);
      });
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'routes-users'
};
