import uuid = require('uuid');
import r = require('rethinkdb');
import c = require('../../src/config');
import q = require('../../src/dbutils/query');
import errors = require('../../src/errors/errors');
import models = require('../../src/models/models');
import carpoolSvc = require('../../src/services/carpool.svc');
import userSvc = require('../../src/services/user-service');
import utils = require('../utils');

var db = 'froyo';
var table = 'carpools';

function expectFalse(arg) {
  expect(arg).toBe(false);
}

function expectTrue(arg) {
  expect(arg).toBe(true);
}
function createCarpool(n: string, c: models.Campus, d: string, o: string)
: () => Promise<models.Carpool> {
  return () => {return carpoolSvc.createCarpool(n, c, d, o)}
}

function doesCarpoolExist(carpoolName: string): () => Promise<boolean> {
  return () => { return carpoolSvc.doesCarpoolExist(carpoolName)}
}

var owner:models.User;

var carpoolID: string;
// Create a user first

describe('CarpoolService', () => {

  beforeAll((done) => {
    userSvc.createUser('_', '_', utils.rs(), utils.em(), '_', '_')
      .then((user) => {
        owner = user;
      })
      .catch(fail)
      .error(fail)
      .finally(done);
  });

  it('should create a carpool', (done) => {

    var campus:models.Campus = {
      name: 'FroYoCampus',
      address: {
            address: '123 Elm St',
            geoCode: {
                lat: 100,
                long: 100
            }
          },
    };

    doesCarpoolExist('fropool')()
      .then(expectFalse)
      .then(createCarpool('fropool', campus, 'first carpool', owner.userName))
      .then((carpool) => {
        expect(carpool.name).toBe('fropool');
        expect(carpool.description).toBe('first carpool');
        expect(carpool.campus).toBe(campus);
        expect(carpool.owner).toEqual(owner.id);
        expect(carpool.participants.length).toBe(1);
        expect(carpool.participants[0]).toEqual(owner.id);
        carpoolID = carpool.id;
        expect(carpool.id).toBeDefined();
      })
      .then(doesCarpoolExist('fropool'))
      .then(expectTrue)
      .catch(fail)
      .error(fail)
      .finally(done);
  });

  it('should get a carpool by id', (done) => {

    carpoolSvc.getCarpoolByID(carpoolID)
      .then( (carpool) =>{
        expect(carpool.name).toBe('fropool');
        expect(carpool.description).toBe('first carpool');
        expect(carpool.id).toBeDefined();
      })
      .catch(fail)
      .error(fail)
      .finally(done);
  });


  it('should get the carpool owner\'s email', (done) => {

    carpoolSvc.getOwnerEmail(carpoolID)
      .then( (emailString) =>{
        expect(emailString).toBe(owner.email);
      })
      .catch(fail)
      .error(fail)
      .finally(done);
  });

  it('should get all of the emails for the users', (done) => {

    carpoolSvc.getUserEmails(carpoolID)
      .then( (emailString) =>{
        expect(emailString).toBe(owner.email);
      })
      .catch(fail)
      .error(fail)
      .finally(done);
  });

  it('should get all of the emails except the email provided', (done) => {

    carpoolSvc.getUserEmails(carpoolID, owner.email)
      .then( (emailString) =>{
        expect(emailString).toBe("");
      })
      .catch(fail)
      .error(fail)
      .finally(done);
  });

  it('should add a user to a carpool for a valid owner', (done) => {

    carpoolSvc.addUserToCarpool(carpoolID, owner.id, "123456789")
      .then( (_carpool) =>{
        expect(_carpool.participants).toEqual([owner.id, "123456789"]);
      })
      .catch(fail)
      .error(fail)
      .finally(done);
  });

  it('should not add a user to a carpool for an invalid owner', (done) => {

    carpoolSvc.addUserToCarpool(carpoolID, "123456789", "1234")
      .then(fail)
      .catch(errors.NotCarpoolOwner, done)
  });

  it('should not add a user to a carpool if that user is already in the carpool', (done) => {
    carpoolSvc.addUserToCarpool(carpoolID, owner.id, "123456789")
      .then(fail)
      .catch(errors.UserAlreadyInCarpool, done)
  });

});
