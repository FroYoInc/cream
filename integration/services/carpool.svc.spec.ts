import uuid = require('uuid');
import r = require('rethinkdb');
import c = require('../../src/config');
import q = require('../../src/dbutils/query');
import errors = require('../../src/errors/errors');
import models = require('../../src/models/models');
import carpoolSvc = require('../../src/services/carpool.svc');

var db = 'froyo';
var table = 'carpools';

function expectFalse(arg) {
  expect(arg).toBe(false);
}

function expectTrue(arg) {
  expect(arg).toBe(true);
}
function createCarpool(n: string, c: models.Campus, d: string)
: () => Promise<models.Carpool> {
  return () => {return carpoolSvc.createCarpool(n, c, d)}
}

function doesCarpoolExist(carpoolName: string): () => Promise<boolean> {
  return () => { return carpoolSvc.doesCarpoolExist(carpoolName)}
}

describe('CarpoolService', () => {
  it('should create a carpool', (done) => {

    var campus:models.Campus = {
      name: 'FroYoCampus',
      location: {x: 100, y: 100},
    };

    doesCarpoolExist('fropool')()
      .then(expectFalse)
      .then(createCarpool('fropool', campus, 'first carpool'))
      .then(doesCarpoolExist('fropool'))
      .then(expectTrue)
      .catch(fail)
      .error(fail)
      .finally(done);
  });
});
