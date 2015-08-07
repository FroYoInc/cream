import restify = require('restify');
import r = require('rethinkdb');
import carpoolService = require('../services/carpool.svc');
import userCtrl = require('./create-user.ctrl');
import userService = require('../services/user-service');
import campusCtrl = require('./campus.ctrl');
import models = require('../models/models');
import errors = require('../errors/errors');

module CarpoolController {
  export interface OutputJSON {
    name: string;
    description: string;
    owner: userCtrl.OutputJSON;
    campus: any; // This should be of type CampusController.OutputJSON
    participants: Array<userCtrl.OutputJSON>;
    pickupLocation: models.Address;
    href: string;
  }

  export function toOutputJSON(carpool:models.Carpool):OutputJSON {
    return {
      'name': carpool.name,
      'description': carpool.description,
      'owner': userCtrl.toOutputJSON(carpool.owner),
      'campus': campusCtrl.toOutputJSON(carpool.campus),
      'participants': carpool.participants.map(userCtrl.toOutputJSON),
      'pickupLocation': carpool.pickupLocation,
      'href': '/carpools/' + carpool.id
    };
  }
  export function createCarpool(
    req:restify.Request, res:restify.Response, next:restify.Next) {
      var carpoolName:string = req.body.name;
      var campusName:string = req.body.campus;
      var description:string = req.body.description;
      var owner:string = req.body.owner;
      var pickupLocation:models.Address = req.body.pickupLocation;

      userService.userAlreadyHasCarpool(req.session["userID"])
      .then( (result) => {
        if(!result){
          carpoolService.createCarpool(
            carpoolName, campusName, description, owner, pickupLocation)
            .then((carpool) => {
              res.send(201, toOutputJSON(carpool));
            })
            .catch(errors.CarpoolOwnerNotFoundException,
              errors.CampusNotFoundException, (err) => {
              next(new restify.NotAcceptableError(err.message));
            })
            .catch(errors.CarpoolExistException, (err) => {
              next(new restify.ConflictError(err.message));
            })
            .catch((err) => {
              next(new restify.InternalServerError(err.message));
            })
            .error((err) => {
              next(new restify.InternalServerError(err.message));
            })
            .then(next);
        }
        else{
          next(new restify.ForbiddenError("User alredy in a carpool."));
        }
      })
      .catch(errors.UserNotFoundException, (err) => {
        next(new restify.InternalServerError(err.message));
      })




  }

  export function getCarpool(
    req:restify.Request, res:restify.Response, next:restify.Next) {
    var carpoolid = req.params.carpoolid;

    carpoolService.getCarpoolByID(carpoolid)
      .then((carpool) => {
        res.send(200, toOutputJSON(carpool));
      })
      .catch(errors.CarpoolNotFoundException, (err) => {
        next(new restify.NotFoundError(err.message));
      })
      .catch((err) => {
        next(new restify.InternalServerError(err.message));
      })
      .error((err) => {
        next(new restify.InternalServerError(err.message));
      })
      .then(next);
  }

  export function getCarpools(
    req:restify.Request, res:restify.Response, next:restify.Next) {
    function getCarpoolList() {
      var campusName:string = req.query.campusName;

      if(req.query.radius && req.query.long && req.query.lat) {
        var radius:number = parseFloat(req.query.radius);
        var long:number = parseFloat(req.query.long);
        var lat:number = parseFloat(req.query.lat);

        return carpoolService.getNearestCarpools(10, campusName, radius, long, lat);
      }
      return carpoolService.getCarpools(10, campusName);
    }

    getCarpoolList()
      .then((_carpools) => {
        res.send(200, _carpools.map(toOutputJSON));
        next();
      })
      .catch((err) => {
        next(new restify.InternalServerError(err.message))
      });
  }

  export function updateCarpool(req:restify.Request, res:restify.Response, next:restify.Next) {
    var carpoolID = req.params.carpoolID;

    function getIDFromHref(href:string) : string {
      var hrefComponents = href.split('/');
      return hrefComponents[hrefComponents.length - 1];
    }

    function addFieldFromJSON(JSONObject, newObject, fieldName:string) {
      if (JSONObject[fieldName]) {
        newObject[fieldName] = JSONObject[fieldName];
      }
      return newObject;
    }

    function getCarpoolUpdate(requestBody) {
      var carpoolUpdate = {};
      carpoolUpdate = addFieldFromJSON(requestBody, carpoolUpdate, "name");
      carpoolUpdate = addFieldFromJSON(requestBody, carpoolUpdate, "description");
      carpoolUpdate = addFieldFromJSON(requestBody, carpoolUpdate, "pickupLocation");
      if(requestBody.pickupLocation) {
        carpoolUpdate['geoPoint'] = r.point(requestBody.pickupLocation.geoCode.long, requestBody.pickupLocation.geoCode.lat);
      }
      if(requestBody.campus) {
        carpoolUpdate["campus"] = getIDFromHref(requestBody.campus);
      }
      return carpoolUpdate;
    }

    carpoolService.updateCarpool(carpoolID, getCarpoolUpdate(req.body))
      .then(() => {
        res.send(204);
      })
      .catch(errors.CarpoolNotFoundException, (err) => {
        next(new restify.NotFoundError(err.message));
      })
      .catch((err) => {
        next(new restify.InternalServerError(err.message));
      })
      .then(next);
  }
}

export = CarpoolController;
