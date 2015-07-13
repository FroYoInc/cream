import restify = require('restify')
import carpoolService = require('../services/carpool.svc')

module CarpoolController {
  export function createCarpool(
    req:restify.Request, res:restify.Response, next:restify.Next) {
      var carpoolName:string = req.body.name;
      var campusName:string = req.body.campus;
      var description:string = req.body.description;
      var owner:string = req.body.owner;

      console.log(carpoolName, campusName, description, owner);
      carpoolService.createCarpool(
        carpoolName, campusName, description, owner)
        .then((carpool) => {
          res.send(201, carpool);
        })
        .catch((err) => {
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
