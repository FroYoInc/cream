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

function createCarpool(
  n: string, c: string, d: string, o: string, a:models.Address)
: () => Promise<models.Carpool> {
  return () => {return carpoolSvc.createCarpool(n, c, d, o, a)}
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
    var addr:models.Address = utils.gra();
    doesCarpoolExist('fropool')()
      .then((val) => {expect(val).toBe(false)})
      // Test carpool can be created
      .then(createCarpool(
        'fropool', campus.name, 'carpool', owner.userName, addr))
      .then((carpool) => {
        expect(carpool.name).toBe('fropool');
        expect(carpool.description).toBe('carpool');
        expect(carpool.campus).toEqual(campus);
        expect(carpool.owner).toEqual(owner);
        expect(carpool.participants.length).toBe(1);
        expect(carpool.participants[0]).toEqual(owner);
        expect(carpool.id).toBeDefined();
        // TODO: Fix this when carpool.svc implement pickup location
        /*expect(carpool.pickupLocation).toEqual(addr);*/
      })
      // Test that a carpool cannot be created if one exist with same name
      .then(createCarpool(
        'fropool', campus.name, 'second', owner.userName, addr))
      .catch(errors.CarpoolExistException, _catch)
      .then(checkCaught)
      // Test that a carpool cannot be created if owner does not exist
      .then(createCarpool(
        'yopool', campus.name, 'second', 'non-existantowner', addr))
      .catch(errors.CarpoolOwnerNotFoundException, _catch)
      .then(checkCaught)
      // Test that a carpool cannot be created if ampus does not exist
      .then(createCarpool(
        'yopool', 'invalidcampus', 'second', owner.userName, addr))
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

  it('should add a user to a carpool', (done) => {
    var carpool:models.Carpool;
    var user:models.User;
    // Get a carpool and a new user
    utils.getSomeCarpool()
      .then((_carpool) => {carpool = _carpool})
      .then(utils.createRandomUser)
      .then((_user) => {user = _user})
      // Test participant cannot be added to a non existant carpool
      .then(() => {
        return carpoolSvc.addUserToCarpool('non-existant-carpool-id', user);
      })
      .catch(errors.CarpoolNotFoundException, _catch)
      // Test a user can be added to carpool
      .then(() => {
        expect(carpool.participants.length).toEqual(1);
        return carpoolSvc.addUserToCarpool(carpool.id, user);
      })
      .then((newCarpool) => {
        var list = newCarpool.participants
        .filter((p) => {return p.id == user.id});
        expect(list.length).toEqual(1);
        expect(list[0].id).toEqual(user.id);
        expect(newCarpool.participants.length).toEqual(2);
      })
      // Test participant cannot be added if already in carpool
      .then(() => {
        return carpoolSvc.addUserToCarpool(carpool.id, user);
      })
      .catch(errors.CarpoolParticipantAlreadyInCarpoolExecption, _catch)
      .then(checkCaught)
      // Test participant cannot be added if participant does not exist
      .then(() => {
        return carpoolSvc.addUserToCarpool(carpool.id,
          utils.getNonExistantUser());
      })
      .catch(errors.CarpoolParticipantNotFoundException, _catch)
      .then(checkCaught)
      .catch(fail)
      .error(fail)
      .finally(done);
  });

  it('should retrive carpools a user is participant of', (done) => {
    var carpool:models.Carpool;
    var user:models.User;

    Promise.resolve()
      // Setup
      .then(() => {
        return [utils.createRandomUser(), utils.getSomeCarpool()];
      })
      .spread((u:models.User, c:models.Carpool) => {
        carpool = c; user = u;
      })
      // Test newlt created user is not participant of any carpool
      .then(() => {
        return carpoolSvc.getUserCarpools(user);
      })
      .then((carpools) => {
        expect(carpools.length).toBe(0);
      })
      // Test exception is thrown when invalid user is given
      .then(() => {
        return carpoolSvc.getUserCarpools(utils.getNonExistantUser());
      })
      .catch(errors.UserNotFoundException, _catch)
      .then(checkCaught)
      // Add user to a carpool
      .then(() => {
        return carpoolSvc.addUserToCarpool(carpool.id, user);
      })
      // Test user is participant of carpool by retriveing users's carpools
      .then(() => {
        return carpoolSvc.getUserCarpools(user);
      })
      .then((carpools) => {
        expect(carpools.length).toBe(1);
      })
      .catch(fail)
      .error(fail)
      .finally(done);
  });
});
