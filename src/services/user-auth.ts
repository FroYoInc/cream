import r = require('rethinkdb');
import query = require('../dbutils/query');
import Restify = require('restify');
import userSer = require('../services/user-service');
import models = require('../models/models');
import Promise = require('bluebird');
import bcrypt = require("bcrypt");
import errors = require('../errors/errors');

module UserAuth{

    /**
     * Checks if the user has a valid sesson and rerutns true if they do and false otherwise
     * @param  {Restify.Request} req [The request we are checking for a valid session]
     */
    export function checkAuth(req: Restify.Request): Promise<boolean>{
        return new Promise<boolean>((resolve, reject) => {
            if (req.session == undefined || req.session['userID'] == undefined){
                resolve(false)
            }
            else{
                resolve(true);
            }
        });

    }


    export function authenticateUser(req:Restify.Request, em:string, pass:string) : Promise<boolean> {

        return new Promise<boolean>((resolve, reject) => {
            userSer.getUserByEmail(em)
              .then( (user) => {
                if(user.salt !== undefined){

                    bcrypt.hash(pass, user.salt , (err, hash) => {
                        if(err){
                            reject(err);
                        }
                        else if(hash == user.passwordHash){ // Check if the hashes match
                            userSession(req, user).then( () => {
                                resolve(true);
                            }).catch(Error, (err) => {
                                reject(err);
                            });
                        }
                    });
                }
                else{
                    throw new errors.InvalidUserObject();
                }

            }).catch(errors.UserNotFoundException, (err) => {
                resolve(false);
            });

        });

    }

    /**
     * Creates or updates a user session to the values defined in
     * the user object passed in as an argument
     * @param {restify.Request} req  [The request for the session you wish to update or create.]
     * @param {User}            user [The new/updated user object.  This is used to define the values of the session ]
     * @param {callback}        function [This function takes a callback so that it can pass an error to be handled]
     * 
     */
    export function userSession(req: Restify.Request, user: models.User) : Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (user == undefined){
                throw new errors.UndefinedUserObject();
            }
            else if( user.id == undefined){
                throw new errors.InvalidUserObject();
            }
            else{
                req.session["userID"] = user.id;

                resolve(true);
            }
        });
    }

    /**
     * Destroys the users session
     * @param {Restify.Request} req [The request whose session we wish to destroy]
     * @param {Function}        callback [This function is passed an error to bubble up]
     */
    export function revokeSession(req: Restify.Request, callback : (err:Error) => void) {
        req.session.destroy( function (err){
            callback(err);
        });
    }

    /**
     * Destroys the all of the users sessions.  This is to be used on password change/reset, 
     * user request (Log out all my devices), and account compromise.
     * @param {Restify.Request} req [The request whose session we wish to destroy]
     * @param {Function}        callback [This function is passed an error to bubble up]
     */
    export function revokeSessions(req: Restify.Request) : Promise<boolean>{
        return new Promise<boolean>((resolve, reject) => {
            if(req.session['userID'] != undefined){
                var uid = req.session["userID"];
                query.run(
                    r.db('froyo').table('session').filter({
                        session: {userID: uid} 
                    }).delete()
                )().then( () => {resolve(true);} );
            }
            else{
                throw new errors.SessionUserID();
            }
        });

    }

}
export = UserAuth;

