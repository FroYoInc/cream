/// <reference path="../../typings/express-session/express-session.d.ts" />
import Restify = require('restify');
import auth = require('../services/user-auth');
import userSer = require('../services/user-service');
import models = require('../models/models');
import Promise = require('bluebird');
import pv = require('../validation/parameter-validator');
import utils = require('../utils/utils');
import uuid = require('uuid');
import errors = require("../errors/errors");
import EmailService = require('../services/email-service');


module userControllers{

    /**
     *  The controller for the user login function, verifies the params that it needs
     *  to function correctly, and checks that they are all defined.  Sends a 400 if they
     *  are not.  If the params are all defined, then it attempts to log the user in.
     */

    export function checkAdmin(req:Restify.Request,res:Restify.Response,next) {
      var p = req.params;
      auth.checkAdmin(req).then(  (validAdmin) => {
        if(validAdmin) {
          res.send(200);
        } else {
          res.send(403, {"message" : "Not logged in as admin"});
        }
        }).catch(errors.UserNotFoundException, (err) => {
          res.send(404);
          });
}

    export function login(req:Restify.Request,res:Restify.Response,next){
        var p = req.params;
        var validReq = pv.verifyParams(p.email, p.password);
        if(validReq){
            auth.authenticateUser(req, p.email, p.password)
                .then( (status) => {
                    if(status === 200){
                       res.send(status, {
                           userID : req.session["userID"],
                           firstName: req.session["firstName"],
                           lastName: req.session["lastName"],
                           userName: req.session["userName"],
                           email: req.session["email"]
                       });
                    }
                    else{
                        res.send(status);
                    }

                }).catch(Error, (err)=> {
                    res.send(500,{"message": err});
                });
        }
        else{
            res.send(400,{"message": "Bad Request: invalid or missing parameters"});
        }
        next();
    }

    /**
     * The controller for the user logout function.  Revokes the users session and sends
     * a 200 if the revokation is a success and a 500 otherwise.
     */
    export function logout(req:Restify.Request, res:Restify.Response, next){
        auth.revokeSession(req).then( (success) => {
            if(!success){
                res.send(500, {"message": "Logout failed.  Unable to revoke session."});
            }
            else{
                res.header('Location', '/');
                res.send(302);
            }
        });

        next();
    }
    export function resetPasswordHandler(req:Restify.Request, res:Restify.Response, next){
        resetPassword(req)
        .then( (status) => {
            res.send(status);
        })
        .catch(Error, (err) => {
            res.send(500);
        })
    }

    export function resetPassword(req:Restify.Request) : Promise<number>{
        return new Promise<number> ( (resolve, reject) => {
            var p = req.params;
            var validReq = pv.verifyParams(p.email);
            if(!validReq){
                resolve(400);
            }
            userSer.changeUserPassword(p.email, uuid.v4().replace(/-/g, ''), sendReset)
            .then((result) => {
                result? resolve(200) : resolve(406);
            })
            .catch(errors.UserNotFoundException, (err) => {
                resolve(404);    
            })
            .catch(Error, (err) => {
                resolve(500);
            })
        })

          function sendReset(user:models.User, password:string) {
            var emailService = new EmailService.EmailService();
            return emailService.sendPassReset(user, password);
          }
    }

    export function changePasswordHandler(req:Restify.Request, res:Restify.Response, next){
        changePassword(req)
        .then( (status) => {
            res.send(status);
        })
        .catch(Error, (err) => {
            res.send(500);
        })
    }

    export function changePassword(req:Restify.Request) : Promise<number>{
        return new Promise<number> ( (resolve, reject) => {
            var p = req.params;
            var validReq = pv.verifyParams(p.curPassword, p.newPassword, p.confirmPassword);
            if(!validReq){
                resolve(400);
            }
            if(p.newPassword !== p.confirmPassword){
                resolve(409);
            }
            auth.authenticateUser(req, req.session["email"], p.curPassword)
                .then( (status) => {
                    if(status === 200){
                        userSer.changeUserPassword(req.session["email"], p.newPassword)
                        .then((result) => {
                            result ? resolve(200) : resolve(406);
                        })
                        .catch(errors.UserNotFoundException, (err) => {
                            resolve(404);    
                        })
                        .catch(Error, (err) => {
                            resolve(500);
                        })
                    }
                    else{
                        resolve(status);
                    }

                }).catch(Error, (err)=> {
                    resolve(500);
                });

        })
    }

}

export = userControllers;
