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
     * Checks if the user has a valid session
     * @param  {Restify.Request}  req [The request to be verified]
     * @return {Promise<boolean>}     [A promise that a boolean will be returned]
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

    /**
     * Checks if the user is in the database. If they are in the database, it hashes
     * the password that is provided and checks it againts the hash in the database.
     * @param  {Restify.Request}  req  [The rquest of the user to be authenticated]
     * @param  {string}           em   [The user's email]
     * @param  {string}           pass [The user's plaintext password]
     * @return {Promise<boolean>}      [A promise that the function will return a boolean]
     */
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

