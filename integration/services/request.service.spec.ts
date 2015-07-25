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


  function createRequest(userID:string, carpoolID:string, firstName:string, 
                                  lastName:string, carpoolName: string){
    return reqServ.createRequest(userID, carpoolID, firstName, lastName, carpoolName);
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

  function getAllUserRequests(user:models.User){
    return reqServ.getAllRequestsForUser(user);
  }

  var numReq = 0;
  it('should create requests', (done) => {
      createRequest(joinRequest.userID, joinRequest.carpoolID, "Peter", "Higgs", "someCarpool")
      .then( (result) => {
          testTrue(result);
          ++numReq;
      })
      createRequest(joinRequest.userID + 1, joinRequest.carpoolID, "Peter", "Higgs", "someCarpool")
      .then( (result) => {
          testTrue(result);
          ++numReq;
      })
      createRequest(joinRequest.userID + 2, joinRequest.carpoolID, "Peter", "Higgs", "someCarpool")
      .then( (result) => {
          testTrue(result);
          ++numReq;
      })
      createRequest(joinRequest.userID, "someOtherCarpool", "Peter", "Higgs", "someOtherCarpool")
      .then( (result) => {
          testTrue(result);
          ++numReq;
      })
      createRequest(joinRequest.userID + 1, "someOtherCarpool", "Peter", "Higgs", "someOtherCarpool")
      .then( (result) => {
          testTrue(result);
          ++numReq;
      })
      createRequest(joinRequest.userID + 2, "someOtherCarpool", "Peter", "Higgs", "someOtherCarpool")
      .then( (result) => {
          testTrue(result);
          ++numReq;
      })
      .catch(Error, fail)
      .error(fail)
      .finally(done);
  });

  it('should find a request by userID', (done) => {
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

  it('should find a request by carpoolID', (done) => {
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

  it('should get all requests for all of the carpools a user belongs to', (done) => {

      var user : models.User = {
            id: '1234fkasdkl',
            firstName: 'Peter',
            lastName: 'Higgs',
            userName: 'pHiggs',
            email: utils.validEmail('higgsGarbage'),
            isAccountActivated: true,
            carpools:[],
            passwordHash: "bofkldkfklsd",
            salt: "djfklsdfklskldf"
      };

      var carpool : models.Carpool;
      carpool = {
        name: "someCarpool",
        owner: user,
        participants: [user],
        description: "Awesome",
        id: "someCarpoolID",
        campus: {
          name : "Cool Campus",
          address : {
            address : '1234 Campus way',
            geoCode : {lat : 12, long : 12}
          }
        }
      };

      var carpool2 : models.Carpool;
      carpool2 = {
        name: "someOtherCarpool",
        owner: user,
        participants: [user],
        description: "Awesome",
        id: "someOtherCarpool",
        campus: {
          name : "Cool Campus",
          address : {
            address : '1234 Campus way',
            geoCode : {lat : 12, long : 12}
          }
        }
      };
      user.carpools = [carpool,carpool2];
      
      getAllUserRequests(user)
      .then((result) => {
        expect(result.length).toBe(numReq);
      })
      .error(fail)
      .finally(done);

  });

  it('should remove a request', (done) => {
      removeRequest(joinRequest.userID, joinRequest.carpoolID)
      .then( (result) => {
          testTrue(result);
      })
      .catch(Error, fail)
      .error(fail)
      .finally(done);
  });
});