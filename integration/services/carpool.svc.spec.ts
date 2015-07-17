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

function createCampus() : Promise<models.Campus> {
  var address:models.Address = {
    address: '123 Sesame Street',
    geoCode: {long: 1, lat: 2}
  }
  return CampusSvc.createCampus('FroyoCampus', address);
}
function createUser():Promise<models.User> {
  return userSvc.createUser('_', '_', utils.rs(), utils.em(), '_', '_');
}
var campus:models.Campus;
var owner:models.User;

var carpoolID: string;

describe('CarpoolService', () => {

// Create a user and campus first
  beforeAll((done) => {
    Promise.resolve()
      .then(() => {
        var p1 = createUser();
        var p2 = createCampus();
        return [p1, p2];
      })
      .spread((_user:models.User, _campus:models.Campus) => {
        owner = _user;
        campus = _campus;
      })
      .catch(fail)
      .error(fail)
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
        carpoolID = carpool.id;
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

    // Ensure error is thrown when trying to retrive non-existant carpool
    carpoolSvc.getCarpoolByID('non-existantCarpoolID')
      .catch(errors.CarpoolNotFoundException, _catch)
      .then(checkCaught)
      // Test a carpool can be retrived
      .then(() => {return carpoolSvc.getCarpoolByID(carpoolID)})
      .then((carpool) =>{
        expect(carpool.name).toBe('fropool');
        expect(carpool.description).toBe('first carpool');
        expect(carpool.id).toBeDefined();
      })
      .catch(fail)
      .error(fail)
      .finally(done);
  });



  /*it('should add a user to a carpool for a valid owner', (done) => {

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
