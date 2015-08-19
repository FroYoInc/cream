import r = require('rethinkdb');
import query = require('../dbutils/query');
import Restify = require('restify');
import userSer = require('../services/user-service');
import models = require('../models/models');
import Promise = require('bluebird');
import bcrypt = require("bcrypt");
import errors = require('../errors/errors');
import c = require('../config');
import pv = require('../validation/parameter-validator');


module UserAuth{

    /**
     * Checks if the user has a valid session
     * @param  {Restify.Request}  req [The request to be verified]
     * @param  {Restify.Response}  res [The restify response]
     * @param  {Restify.Next}   [The next function, to pass control.]
     * @return {Promise<boolean>}     [A promise that a boolean will be returned]
     */
     export function checkAuthMiddle(req: Restify.Request, res: Restify.Response, next){
         if (req.session === undefined){
             res.send(401);
         }
         else{
             var s = req.session;
             var result = pv.verifyParams(s['userID'], s["firstName"], s["lastName"],
                                              s['userName'], s["email"]);
             result ? next() : res.send(401, {"message": "Unauthorized attempt, you must be logged in."});
         }

     }

    export function checkAdmin(req: Restify.Request) : Promise<boolean>{
        return new Promise<boolean>((resolve, reject) => {
            userSer.getUserById(req.session["userID"])
            .then((_user) => {
                resolve(_user.isAdmin === true);
            }).catch(errors.UserNotFoundException, (err) => {
              reject(err);
              })
        })
    }

    /**
     * Checks if the user is in the database. If they are in the database, it hashes
     * the password that is provided and checks it againts the hash in the database.
     * @param  {Restify.Request}  req  [The rquest of the user to be authenticated]
     * @param  {string}           em   [The user's email]
     * @param  {string}           pass [The user's plaintext password]
     * @return {Promise<boolean>}      [A promise that the function will return a boolean]
     */
    export function authenticateUser(req:Restify.Request, em:string, pass:string) : Promise<number> {

        return new Promise<number>((resolve, reject) => {
            userSer.getUserByEmail(em)
              .then( (user) => {
                if(user.isAccountActivated === false){
                    resolve(403);
                }
                else if(user.salt !== undefined){

                    _checkLock(user).then( (unlocked) => {
                        if(unlocked){
                            _hashHandler(req, pass, user, resolve, reject);
                        }
                        else{
                            resolve(423);
                        }
                    });

                }
                else {
                    throw new errors.InvalidUserObject();
                }

            }).catch(errors.UserNotFoundException, (err) => {
                resolve(401);
            }).catch(errors.EmailValidationException, (err) => {
                resolve(401);
            }).catch(Error, (err) => {
                resolve(500);
            });

        });
    }

    function _hashHandler(req : Restify.Request, pass:String, user:models.User, resolve, reject){
        bcrypt.hash(pass, user.salt, (err, hash) => {
            if(err){
                reject(err);
            }
            else if(hash === user.passwordHash){ // Check if the hashes match
                _clearLock(user);
                userSession(req, user).then( () => {
                    resolve(200);
                }).catch(Error, (err) => {
                    reject(err);
                });
            }
            else {
                resolve(401);
            }
        });
    }

    function _checkLock(user: models.User ) : Promise<boolean>{
        return new Promise<boolean>((resolve, reject) => {

            userSer.getUserData(user.id)
              .then( (userData) => {
                // The user has never logged in before.
                if (userData.numLoginAttempts === undefined){

                    userData.numLoginAttempts = 1;
                    userSer.updateUserData(userData).then( () => {
                        resolve(true)
                    });
                }
                // The user has logged in before
                else{
                    var today = new Date();
                    var now = today.getTime() ; // The current epoch time

                    // The user has exceeeded their allowed number of failed attempts
                    if(userData.numLoginAttempts >= c.Config.loginLock.max - 1){

                        // Set the lock
                        if(userData.lockoutExpiration === 0 || userData.lockoutExpiration === undefined){
                            userData.lockoutExpiration = now + c.Config.loginLock.lockoutTime;
                            userSer.updateUserData(userData).then( (userData) => {
                                resolve(false);
                            });
                        }
                        // The lock has expired
                        else if(userData.lockoutExpiration <= now){
                            userData.lockoutExpiration = 0;
                            userData.numLoginAttempts = 1;
                            userSer.updateUserData(userData).then( (userData) => {
                                resolve(true);
                            });
                        }
                        // The user account is still locked
                        else {
                            resolve(false);
                        }
                    }
                    // The user has yet to exceed the allowed login attempts
                    else{
                        userData.numLoginAttempts += 1;
                        userSer.updateUserData(userData).then( (userData) => {
                            resolve(true)
                        });
                    }

                }

              }).catch(errors.UserDataNotFound, (err) => {
                  resolve(err);
              });

        });

    }

    function _clearLock(user: models.User) {
        userSer.getUserData(user.id)
          .then( (userData) => {
              userData.lockoutExpiration = 0;
              userData.numLoginAttempts = 0;
              userSer.updateUserData(userData);

          }).catch(errors.UserDataNotFound, (err) => {

        });

    }
    /**
     * Creates or updates a user session to match the fields in the user object provided
     * @param  {Restify.Request}  req  [The request attached to the session to modified]
     * @param  {models.User}      user [The user object to use to update]
     * @return {Promise<boolean>}
     */
    export function userSession(req: Restify.Request, user: models.User) : Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (user == undefined){
                throw new errors.UndefinedUserObject();
            }
            else{
                var valid = pv.verifyParams(user.id, user.firstName, user.lastName,
                                                user.userName, user.email)
                if(valid){
                    req.session["userID"] = user.id;
                    req.session["firstName"] = user.firstName;
                    req.session["lastName"] = user.lastName;
                    req.session["userName"] = user.userName;
                    req.session["email"] = user.email;
                    resolve(true);
                }
                else{
                    throw new errors.InvalidUserObject();
                }

            }
        });
    }

    /**
     * Rovokes the user's current session
     * @param {Restify.Request} req [The request atached to the session to be destroyed]
     * @param {Error)       =>  void}        callback [A callback function that gets passed any error that occur in destruction]
     */
    export function revokeSession(req: Restify.Request) : Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            req.session.destroy( function (err){
                if(err){
                    resolve(false);
                }
                else{
                    resolve(true);
                }
            });
        });
    }

    /**
     * Rovokes all of the sessions attached to the user
     * @param  {Restify.Request}  req [The request that houses one of the user's session]
     * @return {Promise<boolean>}
     */
    export function revokeSessions(req: Restify.Request) : Promise<boolean>{
        return new Promise<boolean>((resolve, reject) => {
            if(req.session['userID'] !== undefined){
                var uid = req.session["userID"];
                query.run(
                    r.db('froyo').table('session').filter({
                        session: {userID: uid}
                    }).delete(),
                'revokeSessions')().then( () => {resolve(true);} );
            }
            else{
                throw new errors.SessionUserID();
            }
        });

    }

}
export = UserAuth;
