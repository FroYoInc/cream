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

    export function requestExists(userID:string, carpoolID:string) : Promise<boolean> {
        return q.run(
                     r.db(db)
                    .table(table)
                    .filter({userID: userID,carpoolID: carpoolID})
                    .isEmpty()
                    .not()
                )().then( (result) => {
                    return result;
                })
    }

    export function createRequest(userID:string, carpoolID:string) : Promise<boolean> {
        
        var insertRequest = r.db(db).table(table).insert({userID,carpoolID});
        return requestExists(userID, carpoolID).then( (result) => {
            if(result){
                throw new errors.CarpoolRequestConflict();
            }
            else{
                return q.run(insertRequest)()
                        .then((result) => {
                            return result;
                        });
            }
        });

    }

    export function removeRequest(userID:string, carpoolID:string) {
        
        var removeRequest = r.db(db).table(table).filter({userID: userID,carpoolID: carpoolID}).delete();

        return requestExists(userID, carpoolID).then( (result) => {
            if(!result){
                throw new errors.CarpoolRequestNotFound();
            }
            else{
                return q.run(removeRequest)()
                        .then((result) => {
                            return result;
                        });
            }
        });


    }

    export function getRequestByUserID(userID:string){
        
        var getByUserID = r.db(db).table(table).filter({userID: userID}).coerceTo('array');
        
        return q.run(getByUserID)()
                .then((result) => {
                    return result;
                });
    }

    export function getRequestByCarpoolID(carpoolID:string){
        
        var getByCarpoolID = r.db(db).table(table).filter({carpoolID: carpoolID}).coerceTo('array');
        
        return q.run(getByCarpoolID)()
                .then((result) => {
                    return result;
                });
    }
}

export = RequestService;