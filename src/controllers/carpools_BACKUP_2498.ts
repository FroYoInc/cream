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
            var s = req.session;
            userServ.getUserById(s['userID'])
            .then( (user) => {
              if(user.carpools.length >= 1){
                resolve(403);
              }
              else{
                carpoolServ.getCarpoolByID(req.params.carpoolID)
                .then( (_carpool) =>{
                  requestServ.createRequest(s["userID"], req.params.carpoolID,s["firstName"], s["lastName"], _carpool.name)
                    .then( (result) => {
                      if(result){
                        sendRequest(_carpool)
                        .then(()=>{
                          resolve(201);
                        })
                        .catch(errors.CarpoolJoinRequestSendException, (err) =>{
                          resolve(201);
                        });
                      }
                      else{
                        resolve(500);
                      }
                    }).catch(errors.CarpoolRequestConflictException, (err) => {
                      resolve(409);
                    });
                })
                .catch(Error, (err) => {resolve(500)});
              }
            })
            .catch(errors.UserNotFoundException, (err) => {
              resolve(404);
            })

          }

          else {
            resolve(400);
          }
        });

      function sendRequest(carpool:models.Carpool) {
        return emailSvc.sendRequestToJoin(carpool);
      }

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
              .catch(errors.CarpoolRequestNotFoundException, (err) => {
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
<<<<<<< HEAD
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
=======
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
              });
>>>>>>> develop
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
          .catch(errors.CarpoolRequestNotFoundException, (err) => {
            resolve(404);
          })
      }

    }

    export function getNotificationsHelper(req: Restify.Request) : Promise<any>{
      return new Promise<any>((resolve, reject) => {
        userServ.getUserById(req.session["userID"])
        .then( (_user)=>{
          requestServ.getAllRequestsForUser(_user)
          .then( (notifications) => {
            resolve({status: 200, data : notifications ? notifications : []});
          })
        })
        .catch(errors.UserNotFoundException, (err) => {
          resolve({status: 404, data : "User not found"});
        })

      });
    }

    export function getNotifications(req: Restify.Request, res: Restify.Response, next) {
      getNotificationsHelper(req)
      .then((result) => {
        res.send(result.status, result.data);
      })
    }

    export function getUserCarpools(req: Restify.Request, res: Restify.Response, next){
        userServ.getUserById(req.session["userID"])
        .then( (user) => {
          carpoolServ.getUserCarpools(user)
          .then( (carpools) => {
            var data = carpools[0] != undefined ? carpools[0] : null;
            res.send(200, data);
            next();
          })
          .catch(errors.UserNotFoundException, (err) =>{
            res.send(404, {"message":  "User not found"});
            next();
          });
        })
        .catch(errors.UserNotFoundException, (err) => {
          res.send(404, {"message":  "User not found"});
          next();
        })

    }
}
export = carpoolControllers;
