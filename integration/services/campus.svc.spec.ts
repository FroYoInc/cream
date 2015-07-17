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
var campusID: string;

var TempAddress : models.Address = {
  address : '1234 Campus way',
  geoCode : {lat : 12, long : 12}
};

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

function createCampus(CampusName: string, location: models.Address)
: () => Promise<models.Campus> {
    return () => {return campusSrv.createCampus(CampusName, location)}
}

describe('Campus Service ' , () => {

  it('should create a Campus', (done) => {
    createCampus('FroCampus', TempAddress)()
    .then((campus) => {
      expect(campus.name).toBe('FroCampus');
      expect(campus.address).toBe(TempAddress);
      campusID = campus.id;
      expect(campus.id).toBeDefined();
    })
    //Test of campus has already been created and
    //check for exception
    .then(createCampus('FroCampus', TempAddress))
    .catch(errors.CampusNameExistsException, _catch)
    .then(checkCaught)
    //fail if other errors are cought
    .catch(fail)
    .error(fail)
    .finally(done);
  });

  it('should find campus by name', (done) => {
    campusSrv.getCampusByName('non-existentCampusName')
    .catch(errors.CampusNotFoundException, _catch)
    .then(checkCaught)
    .then(() => {return campusSrv.getCampusByName('FroCampus')})
    .then((campus) => {
      expect(campus.name).toBe('FroCampus');
      expect(campus.address).toEqual(TempAddress);
      expect(campus.id).toBeDefined();
    })
    .catch(fail)
    .error(fail)
    .finally(done);

    })

    it('should find campus by id', (done) => {
      campusSrv.getCampusById('fakeid')
      .catch(errors.CampusNotFoundException, _catch)
      .then(checkCaught)
      .then(() => {return campusSrv.getCampusById(campusID)})
      .then((campus) => {
        expect(campus.id).toEqual(campusID);
      })
      .catch(fail)
      .error(fail)
      .finally(done);

      });

    it('should not create a campus with invalid name', (done) => {
      createCampus('', TempAddress)()
      .catch(errors.CampusNameValidationException, _catch)
      .then(checkCaught)
      .finally(done);
    })


});
