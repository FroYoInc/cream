
import Restify = require('restify');
import es = require('express-session');
import Promise = require('bluebird');
import utils = require('../utils');
import CampusController = require('../../src/controllers/campus.ctrl');
import CampusService = require('../../src/services/campus.svc');
import config = require('../../src/config');
import models = require('../../src/models/models');
import auth = require('../../src/services/user-auth');
import q = require('../../src/dbutils/query');
import r = require('rethinkdb');

function createCampus(req, res):Promise<void> {
  return new Promise<void>((resolve, reject) => {
    function next(err) {
      if (err) {
        reject(err);
      } else {
        resolve(null);
      }
    };

    CampusController.createCampus(req, res, next);
  });
}


class Session {
  [key: string] : any;
}

class Request {
  session: Session;
  body: Body;
}


class Body{
  name: any;
  address: any;
}

class Response {
  session: Session;
}

class restify {
  req: Request;
  res: Response;
}

describe('Campus Controller', () => {


  it('should create a campus', (done) => {

    var campusName = utils.rs();
    var address = utils.rs() + " St.";
    var lat = Math.floor(Math.random() * 100);
    var long = Math.floor(Math.random() * 100);

    var inputJSON = {
      'name': campusName,
      'address': {
        'address': address,
        'geoCode': {
          'lat': lat,
          'long': long
        }
      }
    };

    function test0(status, outputJson: CampusController.OutputJSON) {
      expect(status).toBe(201);
      expect(outputJson.name).toBe(campusName);
      expect(outputJson.address.address).toBe(address);
      expect(outputJson.address.geoCode.lat).toBe(lat);
      expect(outputJson.address.geoCode.long).toBe(long);
      expect(outputJson.href).toBeDefined();
      var hasHref = (outputJson.href.indexOf('/campuses/') > -1);
      expect(hasHref).toEqual(true);
    }


    var res = <Restify.Response> {send: test0};
    
    var good = new restify();
    good.req = new Request();
    good.req.session = new Session();  
    good.req.body = inputJSON;


    var adminIdQuery = r.db("froyo").table("users").filter({isAdmin : true}).coerceTo("array").limit(1);
    q.run(adminIdQuery)().then( (admin) => {
      good.req.session["userID"] =  admin[0].id;
      createCampus(good.req, res)
        .then(() => {
          res.send = () => {}
          return createCampus(good.req, res);
        })
        .catch(Restify.ConflictError, (err) => {
          expect(err.statusCode).toBe(409);
          var msg = 'CampusNameExistsException: The campus name is already in use.';
          expect(err.message).toBe(msg);
          expect(err.body.message).toBe(msg);
          expect(err.body.code).toBe('ConflictError');

          inputJSON.name = utils.rs()
          good.req.body = inputJSON;

          return createCampus(good.req, res)
        })
        .catch(fail)
        .error(fail)
        .finally(done);
      });
  });


  xit('should send error when campus name is invalid', (done) => {
    var inputJSON = {
      'name': '', // name is empty intentionally.
      'address': {
        'address': utils.rs(),
        'geoCode': {
          'lat': Math.floor(Math.random() * 100),
          'long': Math.floor(Math.random() * 100)
        }
      }
    };
    var res = <Restify.Response> {send: fail};
    var req = <Restify.Request> { };

    var adminIdQuery = r.db("froyo").table("users").filter({isAdmin : true}).coerceTo("array").limit(1);
    q.run(adminIdQuery)().then( (admin) => {
        req.session["userID"] =  admin.id;
        req.body = inputJSON;

        createCampus(req, res)
          .catch(Restify.BadRequestError, (err) => {
            expect(err.statusCode).toBe(400);
            var msg = 'CampusNameValidationException:';
            expect(err.message).toContain(msg);
            expect(err.body.message).toContain(msg);
            expect(err.body.code).toBe('BadRequestError');
          })
          .catch(fail)
          .error(fail)
          .finally(done);
      })

  });

  it('should return the campus that was created', (done) => {

    var campusName = utils.rs();
    var address : models.Address = {
      address: utils.rs(),
      geoCode: {
        lat: 100,
        long: 200
      }
    };
    var createdCampus;

    var req : Restify.Request = <Restify.Request>{};
    var res : Restify.Response = <Restify.Response>{ send: checkIfCampusExists };

    function getCampusList() {

      function next(err) {
        if (err) {
          fail();
        }
      }

      return CampusController.listCampuses(req, res, next);
    }

    function isCampusMatch(left, right) {
      return left.name == right.name && right.href.indexOf(left.id);
    }

    function checkIfCampusExists(statusCode, list) {
      expect(statusCode).toBe(200);
      expect(list.length).toBeGreaterThan(0);

      var found = false;

      for (var index = 0; index < list.length; index++) {
        found = isCampusMatch(createdCampus, list[index]);

        if (found) {
          break;
        }
      }

      expect(found).toBeTruthy();
    }

    function saveCampusObject(campus) {
      createdCampus = campus;
    }

    CampusService.createCampus(campusName, address)
      .then(saveCampusObject)
      .then(getCampusList)
      .catch(fail)
      .error(fail)
      .finally(done);
  });
});
