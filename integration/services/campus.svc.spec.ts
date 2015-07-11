import uuid = require('uuid');
import r = require('rethinkdb');
import c = require('../../src/config');
import q = require('../../src/dbutils/query');
import errors = require('../../src/errors/errors');
import models = require('../../src/models/models');
import campusSrv = require('../../src/services/campus.svc');
import userSvc = require('../../src/services/user-service');
import utils = require('../utils');

var db = 'froyo';
var table = 'carpools';
var campusNameIndex = 'name';

function expectFalse(arg) {
  expect(arg).toBe(false);
}

function expectTrue(arg) {
  expect(arg).toBe(true);
}

function createCampus(CampusName: string, location: models.Address)
: () => Promise<models.Campus> {
  return () => {return campusSrv.createCampus(CampusName, location)}
}

describe('CampusService' , () => {

  beforeAll((done) => {
    var campus = models.Campus = {
      name : 'FroYoCampus',
      location : {x: 100, y: 100},
    };
    campusSrv.createCampus(campus.name, campus.location)
       .then((_campus) =>{
        expect(campus.name).equals(_campus.name);
        expect(campus.location).equals(_campus.location) 
        });


  });

  it('should create a campus', (done) => {
    createCampus
    })

});
