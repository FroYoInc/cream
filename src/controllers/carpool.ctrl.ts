import restify = require('restify')
import carpoolService = require('../services/carpool.svc')

module CarpoolController {
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
