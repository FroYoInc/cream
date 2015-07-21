import Promise = require('bluebird');
import r = require('rethinkdb');
import uuid = require('uuid');
import EmailService = require('./email-service');
import nodemailer = require('nodemailer');
import q = require('../dbutils/query');
import models = require('../models/models');
import errors = require('../errors/errors');
import config = require('../config');


module RequestService {
    var db = "froyo";
    var table = "requests";

    export function requestExists(userID:string, carpoolID:string) :r.Expression<boolean> {
        return r.db(db)
                .table(table)
                .filter({userID: userID,carpoolID: carpoolID})
                .isEmpty()
                .not()
    }

    export function createRequest(userID:string, carpoolID:string) : Promise<boolean> {
        
        var createRequestQuery = r.db(db).table(table).insert({userID,carpoolID});
        var requestExistsQuery = requestExists(userID, carpoolID);

        var createRequestIfItDoesNotExist =
             r.branch(
               requestExistsQuery,
               r.expr('request exists'),
               createRequestQuery
             );

        return q.run(
          createRequestIfItDoesNotExist)()
          .then((result) => {
            if (result == 'request exists') {
                throw new errors.CarpoolRequestConflictException();
            } 
            else {
                return (result.inserted === 1);
            }
          });

    }

    export function removeRequest(userID:string, carpoolID:string) : Promise<boolean> {
        
        var removeRequestQuery = r.db(db).table(table).filter({userID: userID,carpoolID: carpoolID}).delete();
        var requestExistsQuery = requestExists(userID, carpoolID);

        var removeRequestIfItExists =
             r.branch(
               requestExistsQuery,
               removeRequestQuery,
               r.expr('request not found')
             );

        return q.run(
          removeRequestIfItExists)()
          .then((result) => {
            if (result == 'request not found') {
                throw new errors.CarpoolRequestNotFoundException();
            } 
            else {
                return (result.deleted === 1);

            }
          });

    }

    export function getRequestByUserID(userID:string){
        
        var getByUserID = r.db(db).table(table).filter({userID: userID}).coerceTo('array');
        
        return q.run(getByUserID)();
    }

    export function getRequestByCarpoolID(carpoolID:string){
        
        var getByCarpoolID = r.db(db).table(table).filter({carpoolID: carpoolID}).coerceTo('array');
        
        return q.run(getByCarpoolID)();
    }
}

export = RequestService;