import restify = require('restify');
import Promise = require('bluebird');
import utils = require('../utils');
import campusSvc = require('../../src/services/campus.svc');
import userSvc = require('../../src/services/user-service');
import models = require('../../src/models/models');
import userService = require('../../src/services/user-service');
import CarpoolSvc = require('../../src/services/carpool.svc');
import CarpoolCtrl = require('../../src/controllers/carpool.ctrl');
import UserCtrl = require('../../src/controllers/create-user.ctrl');


function createCarpool(req:restify.Request, res:restify.Response)
:Promise<void> {
  return new Promise<void>((resolve, reject) => {
    function next(err) {
      if (err) {
        reject(err)
      } else {
        resolve(null)
      }
    };
    CarpoolCtrl.createCarpool(req, res, next)
  });
}

describe('Carpool controller', () => {

  var campus:models.Campus;
  var owner:models.User;

  beforeAll((done) => {
    // Create a user and a campus
    Promise.resolve()
      .then(() => {
        var p1 = campusSvc.createCampus('PSU', {
          address: '1825 SW Broadway, Portland, OR 97201',
          geoCode: {lat: 45.511490, long: -122.683357}
        });
        var p2 = utils.getSomeUser();
        return [p1, p2]
      })
      .spread((_campus:models.Campus, _user:models.User) => {
        campus = _campus;
        owner = _user;
      })
      .catch(fail)
      .error(fail)
      .finally(done);
  })

  it('should create a carpool', (done) => {
    var inputJSON = {
      'name': 'Corpool',
      'campus': 'PSU',
      'description': 'first carpool',
      'owner': owner.userName
    };

    function test0 (status, outputJSON) {
      expect(status).toBe(201);
      expect(outputJSON.name).toBe(inputJSON.name);
      expect(outputJSON.description).toBe(inputJSON.description);
      expect(outputJSON.owner).toEqual(UserCtrl.toOutputJSON(owner));
      /*TODO: expect(outputJSON.campus).toBe(CampusCtrl.toOutputJSON(campus));*/
      expect(outputJSON.participants).toEqual([UserCtrl.toOutputJSON(owner)]);
      var hasHref = (outputJSON.href.indexOf('/carpools/') > -1);
      expect(hasHref).toEqual(true);
    }

    var req = <restify.Request> {};
    var res = <restify.Response> {send: test0};
    req.body = inputJSON;

    createCarpool(req, res)
      .then(() => {
      })
      .then(() => {
      })
      .catch(fail)
      .error(fail)
      .finally(done);

/*
    getValidActivationCode()
      .then((activationCode) => {
        req.params.activate = activationCode;
      })
      .then(() => {
        return activate(req, res);
      })
      .catch(fail)
      .error(fail)
      .finally(done)*/
  });
})
