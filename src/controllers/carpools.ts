/// <reference path="../../typings/express-session/express-session.d.ts" />
import Restify = require('restify');
import auth = require('../services/user-auth');
import models = require('../models/models');
import Promise = require('bluebird');
import pv = require('../validation/parameter-validator');
import requestServ = require('../services/request-service');
import emailServ = require('../services/email-service');
import carpoolServ = require('../services/carpool.svc');
import errors = require('../errors/errors');


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
                                  // carpoolServ.getCarpoolByID(req.params.carpoolID)
                                  //   .then( (carpool) => {
                                  //     var mailingList = "";

                                  //     for(var i = 0; i < carpool.users.length; ++i{
                                  //       mailingList += carpool.users[i].email;
                                  //       if(i != carpool.users.length - 1{
                                  //         mailingList += ","
                                  //       }
                                  //     }
                                  //     // send the email to the mailing list

                                  //   });
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

    export function approveRequest(req:Restify.Request, res:Restify.Response, next){
        next();
    }

}
export = carpoolControllers;