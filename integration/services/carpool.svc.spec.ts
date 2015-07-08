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
      location: {x: 100, y: 100},
    };

    doesCarpoolExist('fropool')()
      .then(expectFalse)
      .then(createCarpool('fropool', campus, 'first carpool', owner.userName))
      .then((carpool) => {
        expect(carpool.name).toBe('fropool');
        expect(carpool.description).toBe('first carpool');
        expect(carpool.campus).toBe(campus);
        expect(carpool.owner).toEqual(owner);
        expect(carpool.participants.length).toBe(1);
        expect(carpool.participants[0]).toEqual(owner);
        expect(carpool.id).toBeDefined();
      })
      .then(doesCarpoolExist('fropool'))
      .then(expectTrue)
      .catch(fail)
      .error(fail)
      .finally(done);
  });
});
