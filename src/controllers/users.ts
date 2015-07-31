/// <reference path="../../typings/express-session/express-session.d.ts" />
import Restify = require('restify');
import auth = require('../services/user-auth');
import userSer = require('../services/user-service');
import models = require('../models/models');
import Promise = require('bluebird');
import pv = require('../validation/parameter-validator');
import errors = require('../errors/errors');

module userControllers{

    /**
     *  The controller for the user login function, verifies the params that it needs 
     *  to function correctly, and checks that they are all defined.  Sends a 400 if they 
     *  are not.  If the params are all defined, then it attempts to log the user in.
     */
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
            res.send(400,{"message": "Bad Request: invalid or missing paramters"});
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

}

export = userControllers;