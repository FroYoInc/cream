/// <reference path="../../typings/express-session/express-session.d.ts" />
import Restify = require('restify');
import auth = require('../services/user-auth');
import models = require('../models/models');
import Promise = require('bluebird');
import pv = require('../validation/parameter-validator');
import requestServ = require('../services/request-service');
import emailServ = require('../services/email-service');
// import carpoolServ = require('../services/carpool.svc');
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
                                  // carpoolServ.getOwnerEmail(req.params.carpoolID)
                                  //   .then(emailSvc.sendRequestToJoin})
                                  //   .catch(Error, (err) => {});
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
      
          var validReq = pv.verifyParams(req.params.carpoolID, req.params.userToAdd);
          if(validReq){
              auth.checkAuth(req)
                .then( (isAuth) => {
                  if(isAuth){
                    // Make a call to the add user to carpool function and 
                    // send a 200 on success, a 403 if the use making the request is not the owner
                    // and a 500 on some internal error
                    // Make sure to remove the request once it is processed.
                    resolve(200)
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

}
export = carpoolControllers;