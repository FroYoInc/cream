import restify = require('restify')
import carpoolService = require('../services/carpool.svc')
import userCtrl = require('./create-user.ctrl');
import models = require('../models/models');

module CarpoolController {
  export interface OutputJSON {
    name: string;
    description: string;
    owner: userCtrl.OutputJSON;
    campus: any; // This should be of type CampusController.OutputJSON
    participants: Array<userCtrl.OutputJSON>;
  }

  export function toOutputJSON(carpool:models.Carpool):OutputJSON {
    return {
      'name': carpool.name,
      'description': carpool.description,
      'owner': userCtrl.toOutputJSON(carpool.owner),
      'campus': carpool.campus,
      'participants': carpool.participants.map(userCtrl.toOutputJSON)
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
          console.log(carpool);
          res.send(201, carpool);
        })
        .catch((err) => {
          console.error(err);
          res.send(500, err)
        })
        .finally(next);
  }

  export function getCarpools(
    req:restify.Request, res:restify.Response, next:restify.Next) {

    function getCarpoolList() {
      return carpoolService.getCarpools(10);
    }

    getCarpoolList()
      .then((_carpools) => {
        res.send(200, _carpools);
        next();
      })
      .catch((err) => {
        next(new restify.InternalServerError(err.message))
      });
  }
}

export = CarpoolController;
