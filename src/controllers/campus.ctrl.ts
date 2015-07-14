import restify = require('restify')
import CampusService = require('../services/campus.svc');
import utils = require('../utils/utils');
import errors = require('../errors/errors');
import pv = require('../validation/parameter-validator');

module CampusController {

  /**
   * Creates a campus.
   *
   * @param  {restify.Request}  req
   * @param  {restify.Response} res
   * @param  {restify.Next}     next
   */
  export function createCampus(req: restify.Request, res: restify.Response, next: restify.Next) {
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
        res.send(201, _campus);
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
        res.send(200, _list);
        next();
      })
      .catch((err) => {
        next(new restify.InternalServerError(err.message));
      });
  }
}

export = CampusController;
