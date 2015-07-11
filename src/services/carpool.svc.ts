
import Promise = require('bluebird');
import r = require('rethinkdb');
import uuid = require('uuid');
import assert = require('assert');
import q = require('../dbutils/query');
import models = require('../models/models');
import errors = require('../errors/errors');
import userSvc = require('./user-service');
import v = require('../validation/carpoolname.validator');
import userService = require('../../src/services/user-service');

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
    campus: models.Campus, description: string, owner: string)
    :Promise<models.Carpool> {

    var carpool:models.Carpool = <models.Carpool>{};

    function buildCarpoolModel() {
      carpool.name = name;
      carpool.description = description;
      carpool.campus = campus;
      return userSvc.getUserByUserName(owner)
        .then((user) => {
          carpool.owner = user.id;
          carpool.participants = [user.id];
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
      var ownerExistQuery = userSvc.userExistQuery(owner);
      var carpoolDoesNotExistQuery = getCarpoolExistQuery(name).not();
      var ownerExistAndCarpoolDoesNotExistQuery = ownerExistQuery
        .and(carpoolDoesNotExistQuery);

      var createCarpoolQuery = r.db(db)
        .table(table)
        .insert({
          'name': carpool.name,
          'owner': carpool.owner,
          'participants': [carpool.owner],
          'campus': carpool.campus,
          'description': carpool.description
        });

      // Note: Even though buildCarpoolModel check to see if user exist
      // there can be a race condition where a user get removed right after
      // buildCarpoolModel method is completed. So we need to check if user
      // exist before actually inserting the carpool model.
      var createCarpoolIfOwnerExistAndCarpoolDoesNotExistQuery =
        r.branch(
          ownerExistAndCarpoolDoesNotExistQuery,
          createCarpoolQuery,
          r.branch(
              getCarpoolExistQuery(name),
              r.expr('carpool with same name exist'),
              r.expr('owner not found')
          )
        );

      return q.run(createCarpoolIfOwnerExistAndCarpoolDoesNotExistQuery)()
        .then((result) => {
          if (result == 'owner not found') {
            throw new errors.CarpoolOwnerNotFoundException();
          } else if (result == 'carpool with same name exist') {
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
    //var query = r.db('froyo').table('carpools').merge(function (carpool) {
    //  return {owner: r.db('froyo').table('users').get(carpool('owner')) };
    //}).limit(1).coerceTo('array');

    //eqJoin, restructure the object without left/right fields


    return q.run(query)()
      .then((_carpools) => {
        return <Array<models.Carpool>> _carpools;
      });
  }

  // Gets all of the emails for the carpool with the provided id, minues the email provided
  // in the notThisUser string
  export function getUserEmails(carpoolID: string, notThisUser?:string) :  Promise<string> {
    return new Promise<string>((resolve, reject) => {
      getCarpoolByID(carpoolID)
        .then( (_carpool) => {
          var emails:Array<string> = [];

          function appendToArray(email, max){
            var length = (notThisUser ? max - 1 : max);
            if(email != notThisUser){
              emails.push(email);
            }
            if(emails.length == length){
              resolve(emails.join(", "));
            }
          }

          var length = _carpool.participants.length;
          for (var i = 0; i < length; ++i){

            userSvc.getUserById(_carpool.participants[i])
              .then((user) => {
                appendToArray(user.email,length);
              })
              .catch(errors.UserNotFoundException, (err) => {});

          }

        });
    });

  }

  export function getOwnerEmail(carpoolID: string, notThisUser?:string) :  Promise<string> {
    return new Promise<string>((resolve, reject) => {
      getCarpoolByID(carpoolID)
        .then( (_carpool) => {
          var emails:Array<string> = [];

          userSvc.getUserById(_carpool.owner)
            .then((user) => {
              resolve(user.email);
            })
            .catch(errors.UserNotFoundException, (err) => {throw err;});

        });
    });
  }

  export function addUserToCarpool(carpoolID:string, owner:string, userToAdd:string) : Promise<models.Carpool> {
    return new Promise<models.Carpool>((resolve, reject) => {
      var query = r.db(db).table(table).get(carpoolID).update({
                    participants: r.row("participants").append(userToAdd)
                  });

      getCarpoolByID(carpoolID)
        .then( (_carpool) => {
            if(_carpool.owner == owner){
              if(_carpool.participants.indexOf(userToAdd) < 0){ // Make sure the user is not already in the carpool
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
