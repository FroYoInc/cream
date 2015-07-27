import restify = require('restify')
import CampusService = require('../services/campus.svc');
import utils = require('../utils/utils');
import errors = require('../errors/errors');
import pv = require('../validation/parameter-validator');
import models = require('../models/models');
import auth = require('../services/user-auth');

module CampusController {

  export interface OutputJSON {
    name: string;
    address: models.Address;
    href: string;
  }

  export function toOutputJSON(campus: models.Campus): OutputJSON {
    return {
      name: campus.name,
      address: campus.address,
      href: '/campuses/' + campus.id
    };
  }

  export function toOutputJSONArray(campusArray: Array<models.Campus>): Array<OutputJSON> {
    var arr = [];

    for (var index = 0; index < campusArray.length; index++) {
      arr.push(toOutputJSON(campusArray[index]));
    }

    return arr;
  }

  /**
   * Creates a campus.
   *
   * @param  {restify.Request}  req
   * @param  {restify.Response} res
   * @param  {restify.Next}     next
   */

  export function createCampus(req: restify.Request, res: restify.Response, next: restify.Next) {
    auth.checkAdmin(req).then( (isAdmin) => {
        if(isAdmin == true) {
          var campusInfo = req.body;
          var requestValid = pv.verifyParams(
                              campusInfo.name,
                              campusInfo.address,
                              campusInfo.address.address,
                              campusInfo.address.geoCode,
                              campusInfo.address.geoCode.lat,
                              campusInfo.address.geoCode.long);

            if (!requestValid) {
              res.send(400, {"message": "Bad Request: invalid or missing paramters"});
              next();
              return;
            }

          CampusService.createCampus(campusInfo.name, campusInfo.address)
            .then((_campus) => {
              res.send(201, toOutputJSON(_campus));
              next();
            })
            .catch(
              errors.CampusNameValidationException,
              errors.MissingParametersException,
              (err) => {
              next(new restify.BadRequestError(err.message));
            })
            .catch(errors.CampusNameExistsException, (err) => {
              next(new restify.ConflictError(err.message));
            })
            .catch((err) => {
              next(new restify.InternalServerError(err.message));
            });

            //end if(isAdmin == true)
        } else {
          res.send(403, {"message" : "User Must be admin to create campus"});
        }
      })



  }

  export function removeCampus(req: restify.Request, res: restify.Response, next: restify.Next) {
    var param = pv.verifyParams(req.params.CampusName);
    if (param == true) {
      CampusService.removeCampus(req.params.CampusName)
      .catch(errors.CampusNotFoundException, (err) => {
        res.send(404, {"Message" : "Campus name does not exist"})
        });
    } else {
       res.send(400, {"mesage" : " User Must be admin to remove campous"});
    }
  }


  /**
   * Endpoint for listing campuses.
   *
   * @param  {restify.Request}  req
   * @param  {restify.Response} res
   * @param  {restify.Next}     next
   */
  export function listCampuses(req: restify.Request, res: restify.Response, next: restify.Next) {

    CampusService.getCampusList()
      .then((_list) => {
        res.send(200, toOutputJSONArray(_list));
        next();
      })
      .catch((err) => {
        next(new restify.InternalServerError(err.message));
      });
  }
}

export = CampusController;
