
import Promise = require('bluebird');
import r = require('rethinkdb');
import uuid = require('uuid');
import assert = require('assert');
import q = require('../dbutils/query');
import models = require('../models/models');
import errors = require('../errors/errors');
import userSvc = require('./user-service');
import campusSvc = require('./campus.svc');
import v = require('../validation/carpoolname.validator');

var db = 'froyo';
var table = 'carpools';
var carpoolNameIndex = 'name';

module CarpoolService {
  var carpoolNameValidator = new v.CarpoolNameValidator();
  function getCarpoolExistQuery(carpoolName):r.Expression<boolean> {
    return r.db(db)
      .table(table)
      .getAll(carpoolName, {index: carpoolNameIndex})
      .isEmpty().not();
  }

  export function createCarpool(name: string,
    campusName: string, description: string, owner: string)
    :Promise<models.Carpool> {

    var carpool:models.Carpool = <models.Carpool>{};

    function buildCarpoolModel():Promise<void> {
      return Promise.resolve()
        .then(() => {
          var p1 = userSvc.getUserByUserName(owner);
          var p2 = campusSvc.getCampusByName(campusName);
          return [p1, p2]
        })
        .spread((user:models.User, campus:models.Campus) => {
          carpool.name = name;
          carpool.description = description;
          carpool.campus = campus;
          carpool.owner = user;
          carpool.participants = [user];
        })
        .catch(errors.UserNotFoundException, () => {
          throw new errors.CarpoolOwnerNotFoundException();
        });
    }

    function setCarpoolID(result) {
      assert.equal(result.generated_keys.length, 1,
        "expected only 1 object to be created");
      carpool.id = result.generated_keys[0];
      return carpool;
    }

    function insertCarpoolModel() {
      var ownerExistQ = userSvc.userExistQuery(owner);
      var campusExistQ = campusSvc.campusExistsQuery(campusName);
      var carpoolExistQ = getCarpoolExistQuery(name);
      var createCarpoolQuery = r.db(db)
        .table(table)
        .insert({
          'name': carpool.name,
          'owner': carpool.owner.id,
          'participants': [carpool.owner.id],
          'campus': carpool.campus,
          'description': carpool.description
        });

      // Note: Even though buildCarpoolModel ensure campus and user exist,
      // there can be a race condition where a user get removed right after
      // buildCarpoolModel method is completed. So we need to check if user
      // exist before actually inserting the carpool model.
      var createCarpoolIfOwnerExistAndCampusExistAndCarpoolDoesNotExist =
        r.branch(
          ownerExistQ,
          r.branch(
            campusExistQ,
            r.branch(
              carpoolExistQ,
              r.expr('carpool already exist'),
              createCarpoolQuery
            ),
            r.expr('campus not found')
          ),
          r.expr('owner not found')
        );

      return q.run(
        createCarpoolIfOwnerExistAndCampusExistAndCarpoolDoesNotExist)()
        .then((result) => {
          if (result == 'owner not found') {
            throw new errors.CarpoolOwnerNotFoundException();
          } else if (result == 'campus not found') {
            throw new errors.CampusNotFoundException();
          } else if (result == 'carpool already exist') {
            throw new errors.CarpoolExistException();
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
    return q.run(getCarpoolExistQuery(carpoolName))()
      .then((result) => {
        return result === true
      });
  }

  // This should take an id as an argument and return the carpool it is associated with.
  export function getCarpoolByID(carpoolID: string) :  Promise<models.Carpool> {
    var query = r.db(db).table(table).filter({id:carpoolID}).coerceTo('array');
    return q.run(query)()
      .then((_carpool) => {
        assert.equal(true, (_carpool.length <= 1),
          "DB should not have returned more than 1 carpool");
        if (_carpool.length == 0) {
          throw new errors.CarpoolNotFoundException();
        } else {
          var carpool:models.Carpool = _carpool[0];
          return carpool;
        }
      })
  }

  // This should take a limit as an argument and return no more than that number of carpools.
  export function getCarpools(limit: number) :  Promise<Array<models.Carpool>> {
    var query = r.db(db).table(table).limit(limit).coerceTo('array');
    return q.run(query)()
      .then((_carpools) => {
        return <Array<models.Carpool>> _carpools;
      });
  }

  export function addUserToCarpool(carpoolID:string, owner:string, userToAdd:string) : Promise<models.Carpool> {
    return new Promise<models.Carpool>((resolve, reject) => {
      var query = r.db(db).table(table).get(carpoolID).update({
                    participants: r.row("participants").append(userToAdd)
                  });

      getCarpoolByID(carpoolID)
        .then( (_carpool) => {
            if(_carpool.owner.userName == owner){
              if(_carpool.participants.map((u) => {return u.id}).indexOf(userToAdd) < 0){ // Make sure the user is not already in the carpool
                q.run(query)()
                  .then( (result) => {
                    getCarpoolByID(carpoolID)
                      .then((carpool) => {
                        resolve(carpool)
                      })
                  })
              }
              else{
                throw new errors.UserAlreadyInCarpool();
              }
            }
            else{
              throw new errors.NotCarpoolOwner();
            }
        }).catch(Error, (err) => {reject(err);})

    });

  }

}

export = CarpoolService;
