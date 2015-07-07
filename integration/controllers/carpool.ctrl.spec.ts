import models = require('../../src/models/models');
import errors = require('../../src/errors/errors');
import r = require('rethinkdb');
import utils = require('../utils');
import carpoolCtrl = require('../../src/controllers/carpools');

class Session {
  [key: string] : any;
}

class Request {
  session: Session;
  params: Params;
}


class Params{
  carpoolID: any;
}

class Response {
  session: Session;
}

class Restify {
  req: Request;
  res: Response;
}

describe('CarpoolControllers', () => {

  var good =  new Restify();
  good.req = new Request();
  good.req.session = new Session();
  good.req.session["userID"] = 1;
  good.req.session["firstName"] = "Peter";
  good.req.session["lastName"] = "Higgs";
  good.req.session["userName"] = "pHiggs";
  good.req.session["email"] = utils.validEmail("pHiggs");

  good.req.params  = new Params();
  good.req.params.carpoolID  = "someCarpoolID";



  var notLoggedIn = new Restify();
  notLoggedIn.req = new Request();
  notLoggedIn.req.session = new Session();


  notLoggedIn.req.params  = new Params();
  notLoggedIn.req.params.carpoolID  = "someCarpoolID";


  var bad = new Restify();
  bad.req = new Request();
  bad.req.session = new Session();
  bad.req.session["userID"] = 1;
  bad.req.session["firstName"] = "Peter";
  bad.req.session["lastName"] = "Higgs";
  bad.req.session["userName"] = "pHiggs";
  bad.req.session["email"] = utils.validEmail("pHiggs");

  bad.req.params  = new Params();

  var test201 = (result) => {expect(result).toBe(201);}
  var test400 = (result) => {expect(result).toBe(400);}
  var test401 = (result) => {expect(result).toBe(401);}
  var test409 = (result) => {expect(result).toBe(409);}
  var test500 = (result) => {expect(result).toBe(500);}

  function requestToJoin(req){
    return carpoolCtrl.joinRequest(req);
  }


  it('it should create a request', (done) => {
      requestToJoin(good.req)
      .then(test201)
      .error(fail)
      .finally(done);
  });

  it('it should fail when parameters are missing.', (done) => {
      requestToJoin(bad.req)
      .then(test400)
      .error(fail)
      .finally(done);
  });

  it('it should fail when the user is not logged in', (done) => {
      requestToJoin(notLoggedIn.req)
      .then(test401)
      .error(fail)
      .finally(done);
  });

  it('it should fail when the same request already exists', (done) => {
      requestToJoin(good.req)
      .then(test409)
      .error(fail)
      .finally(done);
  });

});