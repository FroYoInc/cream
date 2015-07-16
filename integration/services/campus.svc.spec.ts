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
  geoCode : {lat : 12.00, long : 12.00}
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
: () => Promise<models.Carpool> {
    return () => {return campusSrv.createCampus(CampusName, location)}


describe('Campus Service ' , () => {

    it('should create a Campus', () => {
      createCampus('FroCampus', TempAddress)
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
      .then(checkCaught);
    });

});
