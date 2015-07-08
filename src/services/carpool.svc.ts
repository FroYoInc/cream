
import Promise = require('bluebird');
import r = require('rethinkdb');
import uuid = require('uuid');
import assert = require('assert');
import q = require('../dbutils/query');
import models = require('../models/models');
import errors = require('../errors/errors');
import userSvc = require('./user-service');
import v = require('../validation/carpoolname.validator');

var db = 'froyo';
var table = 'carpools';
var carpoolNameIndex = 'name';

module CarpoolService {
  var carpoolNameValidator = new v.CarpoolNameValidator();
  export function createCarpool(name: string,
    campus: models.Campus, description: string, owner: string)
    :Promise<models.Carpool> {

    var carpool:models.Carpool = <models.Carpool>{};

    function buildCarpoolModel() {
      carpool.name = name;
      carpool.description = description;
      carpool.campus = campus;
      return userSvc.getUserByUserName(owner)
        .then((user) => {
          carpool.owner = user;
          carpool.participants = [user];
        });
    }

    function setCarpoolID(result) {
      assert.equal(result.generated_keys.length, 1,
        "expected only 1 object to be created");
      carpool.id = result.generated_keys[0];
      return carpool;
    }

    function insertCarpoolModel() {
      var ownerExistQuery = userSvc.userExistQuery(owner);
      var createCarpoolQuery = r.db(db)
        .table(table)
        .insert({
          'name': carpool.name,
          'owner': carpool.owner.id,
          'participants': [carpool.owner.id],
          'campus': carpool.campus,
          'description': carpool.description
        });
      var createCarpoolIfOwnerExistQuery = r.branch(
        ownerExistQuery, createCarpoolQuery, r.expr('user does not exist'));

      return q.run(createCarpoolIfOwnerExistQuery)()
        .then((result) => {
          if (result == 'user does not exist') {
            throw new errors.UserNotFoundException();
          } else {
            setCarpoolID(result);
            return carpool;
          }
        });
    }

    return carpoolNameValidator.isValid(name)
      .then(buildCarpoolModel)
      .then(insertCarpoolModel);
  }

  export function doesCarpoolExist(carpoolName: string): Promise<boolean> {
    var carpoolExistQuery = r.db(db)
      .table(table)
      .getAll(carpoolName, {index: carpoolNameIndex})
      .isEmpty().not();

    return q.run(carpoolExistQuery)()
      .then((result) => {
        return result === true
      });
  }

  // This should take an id as an argument and return the carpool it is associated with.
  export function getCarpoolByID(carpoolID: string) :  Promise<models.Carpool> {
    throw new Error("Not Implemented");
  }

}

export = CarpoolService;
