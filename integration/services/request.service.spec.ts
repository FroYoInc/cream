import models = require('../../src/models/models');
import reqServ = require('../../src/services/request-service');
import errors = require('../../src/errors/errors');
import r = require('rethinkdb');
import query = require('../../src/dbutils/query');
import utils = require('../utils');
import userSvc = require('../../src/services/user-service');
import bcrypt = require("bcrypt");


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
    carpoolID: "blahblahblahblah",
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


  it('should create requests', (done) => {
      createRequest(joinRequest.userID, joinRequest.carpoolID, "Peter", "Higgs", "someCarpool")
      .then( (result) => {
          testTrue(result);
      })
      createRequest(joinRequest.userID, "someCarpool", "Peter", "Higgs", "someCarpool")
      .then( (result) => {
          testTrue(result);
      })
      createRequest(joinRequest.userID, "someOtherCarpool", "Peter", "Higgs", "someOtherCarpool")
      .then( (result) => {
          testTrue(result);
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
      var userID = '1234fkasdkl';

      var salt = bcrypt.genSaltSync(10);
      var hash = bcrypt.hashSync("1234", salt);

      query.run(r.db("froyo")
          .table("users")
          .insert({
            id: '1234fkasdkl',
            firstName: 'Bob',
            lastName: 'LobLaw',
            userName: 'LawBlog',
            email: utils.validEmail('BobLobLaw'),
            isAccountActivated: true,
            carpools:["someCarpool", "someOtherCarpool"],
            passwordHash: hash,
            salt: salt
      })
      )()
      .then( (b) => {
        userSvc.getUserById(userID)
          .then( (user) => {
            getAllUserRequests(user)
            .then((result) => {
              expect(result.length >= 1 ).toBe(true);
            })
            .error(fail)
            .finally(done);
          })
          .catch(Error, fail);
      })
      .catch(fail)

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
