/// <reference path="../../typings/express-session/express-session.d.ts" />
import Restify = require('restify');
import auth = require('../services/user-auth');
import models = require('../models/models');
import Promise = require('bluebird');
import pv = require('../validation/parameter-validator');
import requestServ = require('../services/request-service');
import emailServ = require('../services/email-service');
import carpoolServ = require('../services/carpool.svc');
import userServ = require('../services/user-service');
import errors = require('../errors/errors');

var emailSvc = new emailServ.EmailService();

module carpoolControllers{

    export function requestToJoin(req: Restify.Request, res:Restify.Response, next){
        joinRequest(req)
          .then( (status) => {
              res.send(status);
          });
        next();
    }

    export function joinRequest(req: Restify.Request) : Promise<number> {
        return new Promise<number>((resolve, reject) => {  
          var validReq = pv.verifyParams(req.params.carpoolID);
          if(validReq){
            auth.checkAuth(req)
              .then( (isAuth) => {
                if(isAuth){
                  requestServ.createRequest(req.session["userID"], req.params.carpoolID)
                    .then( (result) => {
                      if(result){
                        // Notify the members of the carpool that someone wises to join
                        carpoolServ.getCarpoolByID(req.params.carpoolID)
                          .then(emailSvc.sendRequestToJoin)
                          .catch(Error, (err) => {resolve(500)});
                        resolve(201);
                      }
                      else{
                        resolve(500);
                      }
                    }).catch(errors.CarpoolRequestConflict, (err) => {
                      resolve(409);
                    });
                }
                else{
                  resolve(401);
                }
              });
          }

          else {
            resolve(400);
          }
        });

    }

    export function approveRequest(req: Restify.Request, res:Restify.Response, next){
      approveUserRequest(req)
        .then( (status) => {
            res.send(status);
        });
      next();
    }

    export function approveUserRequest(req:Restify.Request){
      return new Promise<number>((resolve, reject) => {      
        var validReq = pv.verifyParams(req.params.carpoolID, req.params.userToAddID);
        if(validReq){
            auth.checkAuth(req)
              .then( (isAuth) => {
                if(isAuth){
                  carpoolServ.getCarpoolByID(req.params.carpoolID)
                    .then((_carpool) => {
                      var participants = [];
                      _carpool.participants.map((obj) => {
                        participants.push(obj.id);
                      });
                      if(participants.indexOf(req.session["userID"]) >= 0){
                        addUser(req.params.userToAddID, req.params.carpoolID, resolve)
                      }
                      else{
                        resolve(403);
                      }
                    })
                    .catch(errors.CarpoolNotFoundException, (err) => {
                      resolve(404)
                    });
                }
                else{
                  resolve(401);
                }
              });
        }
        else {
          resolve(400);
        }
      });

      function addUser(userID, carpoolID, resolve){
        userServ.getUserById(userID)
          .then( (_user) => {
            requestServ.removeRequest(userID, carpoolID)
              .then( (result) => {
                carpoolServ.addUserToCarpool(carpoolID, _user)
                  .then( (_carpool) => {
                    resolve(200);
                  })
                  .catch(errors.CarpoolParticipantNotFoundException, (err) => {
                    resolve(404);
                  })
                  .catch(errors.CarpoolParticipantAlreadyInCarpoolExecption, (err) => {
                    resolve(409);
                  })
                  .catch(errors.CarpoolNotFoundException, (err) => {
                    resolve(404);
                  })
                  .catch(Error, () => {
                    resolve(500);
                  })
              })
              .catch(errors.CarpoolRequestNotFound, (err) => {
                resolve(404);
              })
            })
            .catch(errors.UserNotFoundException, (err) => {
              resolve(404);
            })
      }
    }

    export function denyRequest(req: Restify.Request, res:Restify.Response, next){
      denyUserRequest(req)
        .then( (status) => {
            res.send(status);
        });
      next();
    }

    export function denyUserRequest(req:Restify.Request){
      return new Promise<number>((resolve, reject) => {      
        var validReq = pv.verifyParams(req.params.carpoolID, req.params.userToDenyID);

        if(validReq){
          auth.checkAuth(req)
            .then( (isAuth) => {
              if(isAuth){
                carpoolServ.getCarpoolByID(req.params.carpoolID)
                  .then((_carpool) => {
                    var participants = [];
                    _carpool.participants.map((obj) => {
                      participants.push(obj.id);
                    });
                    if(participants.indexOf(req.session["userID"]) >= 0){
                      removeUserRequest(req.params.userToDenyID, req.params.carpoolID, resolve);
                    }
                    else {
                      resolve(403);
                    }
                  })
                  .catch(errors.CarpoolNotFoundException, (err) => {
                    // If the carpool does not exist, remove the request  
                    removeUserRequest(req.params.userToDenyID, req.params.carpoolID, resolve);
                  })
                  .catch(Error, (err) => {
                    resolve(500);
                  })
              }
              else{
                resolve(401)
              }
            })
        }
        else {
          resolve(400);
        }
      });

      function removeUserRequest(userID, carpoolID, resolve){
        requestServ.removeRequest(userID, carpoolID)
          .then( (result) => {
            resolve(200);
          })
          .catch(errors.CarpoolRequestNotFound, (err) => {
            resolve(404);
          })
      }

    }
}
export = carpoolControllers;