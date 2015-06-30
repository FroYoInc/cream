/// <reference path="../../typings/express-session/express-session.d.ts" />
import Restify = require('restify');
import auth = require('../services/user-auth');
import userSer = require('../services/user-service');
import models = require('../models/models');
import Promise = require('bluebird');

module userControllers{

    /**
     *  The controller for the user login function, verifies the params that it needs 
     *  to function correctly, and checks that they are all defined.  Sends a 400 if they 
     *  are not.  If the params are all defined, then it attempts to log the user in.
     */
    export function login(req:Restify.Request,res:Restify.Response,next){
        var p = req.params;
        var validReq = _verifyParams(p.email, p.password);
        if(validReq){
            auth.authenticateUser(req, p.email, p.password)
                .then( (status) => {
                    res.send(status);
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

    /**
     * Takes an unrestricted number of arguments and checks it they are undefined.
     * @param  {any[]}   ...args [A list of arguments]
     * @return {boolean}         [This will return true if all of the agruments passed are defined and false otherwise]
     */
    function _verifyParams(...args:any[]) : boolean{
        for(var i = 0; i < arguments.length; ++i){
            if(arguments[i] === undefined){
                return false;
            }
        }
        return true;
    }
}

export = userControllers;