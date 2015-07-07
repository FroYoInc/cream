/// <reference path="../../typings/express-session/express-session.d.ts" />
import Restify = require('restify');
import auth = require('../services/user-auth');
import models = require('../models/models');
import Promise = require('bluebird');
import pv = require('../validation/parameter-validator');


module carpoolControllers{

    export function requestToJoin(req: Restify.Request, res:Restify.Response, next){
           var p = req.params;
           var validReq = pv.verifyParams(p.carpoolID);
           if(validReq){

           }
           else {
            res.send(400, {"message": "Bad Request. Missing parameters"})
           }
    }

}
export = carpoolControllers;