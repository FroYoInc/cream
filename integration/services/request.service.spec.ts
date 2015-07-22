import models = require('../../src/models/models');
import reqServ = require('../../src/services/request-service');
import errors = require('../../src/errors/errors');
import r = require('rethinkdb');
import query = require('../../src/dbutils/query');
import utils = require('../utils');

class Session {
  [key: string] : any;
}

class Request {
  session: Session;
}

class Response {
  session: Session;
}

class Restify {
  req: Request;
  res: Response;
}

describe('RequestService', () => {

  var good =  new Restify();
  good.req = new Request();
  good.req = new Response();
  good.req.session = new Session();
  good.req.session["userID"] = "123456789";

  var joinRequest = {
    userID: good.req.session["userID"],
    carpoolID: "someCarpoolID",
  }

  var testFalse = (result) => {expect(result).toBe(false);}
  var testTrue = (result) => {expect(result).toBe(true);}


  function createRequest(userID:string, carpoolID:string){
    return reqServ.createRequest(userID, carpoolID);
  }

  function removeRequest(userID:string, carpoolID:string){
    return reqServ.removeRequest(userID, carpoolID);
  }

  function getByUserID(userID:string){
    return reqServ.getRequestByUserID(userID);
  }

  function getByCarpoolID(carpoolID:string){
    return reqServ.getRequestByCarpoolID(carpoolID);
  }


  it('it should create a request', (done) => {
      createRequest(joinRequest.userID, joinRequest.carpoolID)
      .then( (result) => {
          testTrue(result);
      })
      .catch(Error, fail)
      .error(fail)
      .finally(done);
  });

  it('it should find a request by userID', (done) => {
      getByUserID(joinRequest.userID)
      .then( (_request) => {
        if(_request[0]){
          return (_request[0].userID == joinRequest.userID);
        }
        else{
          return false;
        }
      })
      .then(testTrue)
      .error(fail)
      .finally(done);
  });

  it('it should find a request by carpoolID', (done) => {
      getByCarpoolID(joinRequest.carpoolID)
      .then( (_request) => {
        if(_request[0]){
          return (_request[0].carpoolID == joinRequest.carpoolID);
        }
        else{
          return false;
        }
      })
      .then(testTrue)
      .error(fail)
      .finally(done);
  });

  it('it should remove a request', (done) => {
      removeRequest(joinRequest.userID, joinRequest.carpoolID)
      .then( (result) => {
          testTrue(result);
      })
      .catch(Error, fail)
      .error(fail)
      .finally(done);
  });
});