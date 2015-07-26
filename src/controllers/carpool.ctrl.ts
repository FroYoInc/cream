import restify = require('restify')
import carpoolService = require('../services/carpool.svc')
import userCtrl = require('./create-user.ctrl');
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
    href: string;
  }

  export function toOutputJSON(carpool:models.Carpool):OutputJSON {
    return {
      'name': carpool.name,
      'description': carpool.description,
      'owner': userCtrl.toOutputJSON(carpool.owner),
      'campus': campusCtrl.toOutputJSON(carpool.campus),
      'participants': carpool.participants.map(userCtrl.toOutputJSON),
      'href': '/carpools/' + carpool.id
    };
  }
  export function createCarpool(
    req:restify.Request, res:restify.Response, next:restify.Next) {
      var carpoolName:string = req.body.name;
      var campusName:string = req.body.campus;
      var description:string = req.body.description;
      var owner:string = req.body.owner;

      carpoolService.createCarpool(
        carpoolName, campusName, description, owner)
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
      return carpoolService.getCarpools(10);
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
