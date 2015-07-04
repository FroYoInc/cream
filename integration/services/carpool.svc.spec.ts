import uuid = require('uuid');
import r = require('rethinkdb');
import c = require('../../src/config');
import q = require('../../src/dbutils/query');
import errors = require('../../src/errors/errors');
import models = require('../../src/models/models');
import carpoolSvc = require('../../src/services/carpool.svc');

describe('CarpoolService', () => {
  xit('should create a carpool', (done) => {
    var campus:models.Campus = {
      name: 'FroYoCampus',
      location: {x: 100, y: 100},
    };
    carpoolSvc.createCarpool('fropool', campus, 'first carpool')
      .finally(done);
  })
});
