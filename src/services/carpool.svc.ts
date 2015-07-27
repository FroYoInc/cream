
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
  function doesCarpoolExistGivenID(carpoolId:string):r.Expression<boolean> {
    return r.db(db)
      .table(table)
      .get(carpoolId)
      .eq(null).not();
  }
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
          'campus': carpool.campus.id,
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
    var _db =  r.db(db);
    var carpoolTable = _db.table(table);
    var getCarpoolQuery = carpoolTable.get(carpoolID).merge({
      'campus': _db.table('campuses').get(r.row('campus')),
      'owner': _db.table('users').get(r.row('owner')),
      'participants': r.row('participants').map((p) => {
          return _db.table('users').get(p);
        })
      });
    var query =
      r.branch(
        carpoolTable.get(carpoolID).eq(null).not(),
        getCarpoolQuery,
        r.expr('carpool not found')
      );
    return q.run(query)()
      .then((_carpool) => {
        if (_carpool == 'carpool not found') {
          throw new errors.CarpoolNotFoundException()
        } else {
          assert.equal(true, (_carpool.id == carpoolID),
          'retrieved object should have same id');
          return _carpool;
        }
      });
  }

  // This should take a limit as an argument and return no more than that number of carpools.
  export function getCarpools(limit: number) :  Promise<models.Carpool[]> {
    var _db = r.db(db);
    var query = _db.table(table).limit(limit).merge({
      'campus': _db.table('campuses').get(r.row('campus')),
      'owner': _db.table('users').get(r.row('owner')),
      'participants': r.row('participants').map((p) => {
        return _db.table('users').get(p);
      })
    }).coerceTo('array');

    return q.run(query)()
      .then((_carpools) => {
        return <Array<models.Carpool>> _carpools;
      });
  }

  export function getUserCarpools(user:models.User) : Promise<Array<models.Carpool>> {
    var userExistQuery = userSvc.userExistQuery(user.userName);
    var getUserCarpoolsQuery = r.db(db)
      .table('users')
      .get(user.id)
      .getField('carpools')
      .map((carpoolId) => {
        return r.db(db)
          .table(table)
          .get(carpoolId)
      });
    var getUserCarpoolsIfUserExistQuery =
      r.branch(
        userExistQuery,
        getUserCarpoolsQuery,
        r.expr('user not found')
      );

    return q.run(getUserCarpoolsIfUserExistQuery)()
      .then((result) => {
        if (result == 'user not found') {
          throw new errors.UserNotFoundException()
        } else {
          return result;
        }
      })
  }

  export interface CarpoolUpdateModel {
    name?:string;
    description?:string;
    campus?:string;
  }

  export function updateCarpool(carpoolID:string, updatedCarpool:CarpoolUpdateModel) : Promise<void> {
    var doesCarpoolExistQuery = doesCarpoolExistGivenID(carpoolID);
    var updateCarpoolQuery = r.db(db).table(table).get(carpoolID).update(updatedCarpool);

    function getCarpoolUpdateQuery() : r.Expression<any> {
      if (updatedCarpool.campus) {
        return r.branch(
          doesCarpoolExistQuery,
          r.branch(
            campusSvc.campusExistsGivenIDQuery(updatedCarpool.campus),
            updateCarpoolQuery,
            r.expr('campus does not exist')
          ),
          r.expr('carpool does not exist')
          );
      } else {
        return r.branch(
          doesCarpoolExistQuery,
          updateCarpoolQuery,
          r.expr('carpool does not exist')
        );
      }
    }

    return q.run(getCarpoolUpdateQuery())()
      .then((result) => {
        if (result == 'carpool does not exist') {
          throw new errors.CarpoolNotFoundException();
        } else if (result == 'campus does not exist') {
          throw new errors.CampusNotFoundException();
        }
      });
  }

  export function addUserToCarpool(carpoolID:string, participant:models.User)
   :Promise<models.Carpool> {
    var participantExistQuery = userSvc.userExistQuery(participant.userName);
    var doesCarpoolExistQuery = doesCarpoolExistGivenID(carpoolID);
    var addParicipantQuery = r.db(db)
    .table(table)
    .get(carpoolID)
    .update({
      'participants': r.row('participants').append(participant.id)
    })
    .and(r.db(db)
      .table('users')
      .get(participant.id)
      .update({'carpools': r.row('carpools').append(carpoolID)}));
    var participantNotInCarpoolQuery = r.db(db).table(table)
      .get(carpoolID).getField('participants').contains(participant.id).not();

    var query = r.branch(
      participantExistQuery,
      r.branch(
        doesCarpoolExistQuery,
        r.branch(
          participantNotInCarpoolQuery,
          addParicipantQuery,
          r.expr('participant already in carpool')
        ),
        r.expr('carpool does not exist')
      ),
      r.expr('participant does not exist')
    );

    return q.run(query)()
      .then((result) => {
        if (result == 'carpool does not exist') {
          throw new errors.CarpoolNotFoundException();
        } else if (result == 'participant does not exist') {
          throw new errors.CarpoolParticipantNotFoundException();
        } else if (result == 'participant already in carpool') {
          throw new errors.CarpoolParticipantAlreadyInCarpoolExecption();
        } else {
          return getCarpoolByID(carpoolID);
        }
      });
  }

}

export = CarpoolService;
