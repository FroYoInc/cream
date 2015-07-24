import restify = require('restify')
import CampusService = require('../services/campus.svc');
import utils = require('../utils/utils');
import errors = require('../errors/errors');
import pv = require('../validation/parameter-validator');
import models = require('../models/models');
import campus = require('./campus.ctrl');
import auth = require('../services/user-auth');


module adminControllers {
    export function CreateCampus(req: restify.Request, res: restify.Response, next: restify.Next){
      auth.checkAdmin(req).then( (isAdmin) => {
         if(isAdmin == true) {
            campus.createCampus(req, res, next);
        } else {
            res.send(403, {"message" : "User Must be admin to create campus"});
          }
        })
     }

    export function RemoveCampus(req: restify.Request, res: restify.Response, next: restify.Next){
      var param = pv.verifyParams(req.params.campusID);
      if (param == true) {
        auth.checkAdmin(req).then( (isAdmin) => {
          if(isAdmin == true) {
           campus.removeCampus(req,res, next);
        }
        })
      } else {
         res.send(400, {"mesage" : " User Must be admin to remove campous"});
      }
    }
    export function editSettings(){

    }

}

export = adminControllers;
