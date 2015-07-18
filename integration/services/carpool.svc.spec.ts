import uuid = require('uuid');
import Promise = require('bluebird');
import r = require('rethinkdb');
import c = require('../../src/config');
import q = require('../../src/dbutils/query');
import errors = require('../../src/errors/errors');
import models = require('../../src/models/models');
import carpoolSvc = require('../../src/services/carpool.svc');
import userSvc = require('../../src/services/user-service');
import CampusSvc = require('../../src/services/campus.svc');
import utils = require('../utils');

var db = 'froyo';
var table = 'carpools';

enum Caught {Yes};
function _catch() {return Caught.Yes}
function checkCaught(arg: Caught) {
  if (arg !== Caught.Yes) {
    fail(new Error("Expected an exception to be caught"))
  }
}
function expectFalse(arg) {
  expect(arg).toBe(false);
}

function expectTrue(arg) {
  expect(arg).toBe(true);
}
function createCarpool(n: string, c: string, d: string, o: string)
: () => Promise<models.Carpool> {
  return () => {return carpoolSvc.createCarpool(n, c, d, o)}
}

function doesCarpoolExist(carpoolName: string): () => Promise<boolean> {
  return () => { return carpoolSvc.doesCarpoolExist(carpoolName)}
}


var owner:models.User;
var campus:models.Campus;

describe('CarpoolService', () => {
  beforeAll((done) => {
    // Set owner and campus
    Promise.resolve()
      .then(() => {
        return [utils.getSomeUser(), utils.getSomeCampuse()]
      })
      .spread((_owner:models.User, _campus:models.Campus) => {
        owner =_owner; campus = _campus;
      })
      .error(fail)
      .catch(fail)
      .finally(done);
  });

  it('should create a carpool', (done) => {
    doesCarpoolExist('fropool')()
      .then(expectFalse)
      // Test carpool can be created
      .then(createCarpool('fropool', campus.name, 'first carpool', owner.userName))
      .then((carpool) => {
        expect(carpool.name).toBe('fropool');
        expect(carpool.description).toBe('first carpool');
        expect(carpool.campus).toEqual(campus);
        expect(carpool.owner).toEqual(owner);
        expect(carpool.participants.length).toBe(1);
        expect(carpool.participants[0]).toEqual(owner);
        expect(carpool.id).toBeDefined();
      })
      // Test that a carpool cannot be created if one exist with same name
      .then(createCarpool('fropool', campus.name, 'second', owner.userName))
      .catch(errors.CarpoolExistException, _catch)
      .then(checkCaught)
      // Test that a carpool cannot be created if owner does not exist
      .then(createCarpool('yopool', campus.name, 'second', 'non-existantowner'))
      .catch(errors.CarpoolOwnerNotFoundException, _catch)
      .then(checkCaught)
      // Test that a carpool cannot be created if ampus does not exist
      .then(createCarpool('yopool', 'invalidcampus', 'second', owner.userName))
      .catch(errors.CampusNotFoundException, _catch)
      .then(checkCaught)
      // Fail if any other error was thrown
      .catch(fail)
      .error(fail)
      .finally(done);
  });

  it('should get a carpool by id', (done) => {
    var carpool:models.Carpool;
    utils.getSomeCarpool()
      .then((_carpool) => {carpool = _carpool})
    // Ensure error is thrown when trying to retrive non-existant carpool
      .then(() => { return carpoolSvc.getCarpoolByID('non-existantid')})
      .catch(errors.CarpoolNotFoundException, _catch)
      .then(checkCaught)
      // Test a carpool can be retrived
      .then(() => {return carpoolSvc.getCarpoolByID(carpool.id)})
      .then((_carpool) =>{
        expect(_carpool.name).toBe(carpool.name);
        expect(_carpool.description).toBe(carpool.description);
        expect(_carpool.id).toBeDefined();
      })
      .catch(fail)
      .error(fail)
      .finally(done);
  });

  /*it('should add a user to a carpool', (done) => {

    carpoolSvc.addUserToCarpool(carpoolID, owner.id, "123456789")
      .then( (_carpool) =>{
        console.log(_carpool)
        expect(_carpool.participants.map((u)=>{return u.id})).toEqual([owner.id, "123456789"]);
      })
      .catch(fail)
      .error(fail)
      .finally(done);
  });*/

  /*it('should not add a user to a carpool for an invalid owner', (done) => {

    carpoolSvc.addUserToCarpool(carpoolID, "123456789", "1234")
      .then(fail)
      .catch(errors.NotCarpoolOwner, done)
  });

  it('should not add a user to a carpool if that user is already in the carpool', (done) => {
    carpoolSvc.addUserToCarpool(carpoolID, owner.id, "123456789")
      .then(fail)
      .catch(errors.UserAlreadyInCarpool, done)
  });*/

});
