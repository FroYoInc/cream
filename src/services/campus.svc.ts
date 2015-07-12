import models = require('../models/models');
import errors = require('../errors/errors');
import v = require('../validation/campusname.validator');
import r = require('rethinkdb');
import q = require('../dbutils/query');
import assert = require('assert');

module CampusService {

  var db = 'froyo';
  var table = 'campuses';
  var campusNameIndex = 'name';

  var campusNameValidator : v.CampusNameValidator = new v.CampusNameValidator();

  /**
   * Inserts a Campus into the database.
   * @param  {models.Campus} campus [description]
   * @return {[type]}               [description]
   */
  function createCampusQuery(campus: models.Campus) {
    return r.db(db)
      .table(table)
      .insert(campus);
  }

  /**
   * Checks if a campus exists, by name.
   * @param  {string} campusName [description]
   * @return {[type]}            [description]
   */
  function campusExistsQuery(campusName: string) {
    return r.db(db)
      .table(table)
      .getAll(campusName, { index: campusNameIndex })
      .isEmpty().not();
  }

  /**
   * Creates a campus.
   * @param  {string}                 campusName [description]
   * @param  {models.Address}         location   [description]
   * @return {Promise<models.Campus>}            [description]
   */
  export function createCampus(campusName: string, location: models.Address) : Promise<models.Campus> {

    var campus : models.Campus = {
      name: campusName,
      address: location
    };

    var createCampusIfDoesNotExistQuery = r.branch(campusExistsQuery(campusName), r.expr('campus exists'), createCampusQuery(campus));
    var createCampusIfDoesNotExist = q.run(createCampusIfDoesNotExistQuery);

    function throwErrorIfCampusExists(result) {
        if (result == 'campus exists') {
            throw new errors.CampusNameExistsException();
        } else {
            return result;
        }
    }

    function setCampusID(result) {
        assert.equal(result.generated_keys.length, 1, "expected only 1 object to be created");

        campus.id = result.generated_keys[0];

        return campus;
    }

    return campusNameValidator.isValid(campusName)
            .then(createCampusIfDoesNotExist)
            .then(throwErrorIfCampusExists)
            .then(setCampusID);
  }

  /**
   * Retrieves a Campus by it's name.
   * @param  {string}                 campusName The campus name.
   * @return {Promise<models.Campus>}            A Promise<models.Campus>
   */
  export function getCampusByName(campusName: string) : Promise<models.Campus> {
    var getCampusByNameQuery = r.db(db)
      .table(table)
      .getAll(campusName, { index: campusNameIndex })
      .coerceTo('array');

    function throwErrorIfCampusNotFound(_campus) {
      if (_campus == null || _campus.length == 0) {
        throw new errors.CampusNotFoundException();
      } else {
        return _campus;
      }
    }

    function returnCampus(_campus) : models.Campus {
      assert.equal((_campus.length <= 1), true,
      "Expected only 0 or 1 campus to return.")
      if (_campus.length === 0) {
        throw new errors.UserNotFoundException();
      } else {
        var campus:models.Campus = _campus[0]
        return campus;
      }
    }

    return q.run(getCampusByNameQuery)()
      .then(throwErrorIfCampusNotFound)
      .then(returnCampus);
  }

  /**
   * Returns a campus located by it's ID.
   *
   * @param  {string}                 id The campus ID.
   * @return {Promise<models.Campus>}    A Promise<models.Campus>
   */
  export function getCampusById(id: string) : Promise<models.Campus> {
    var getCampusByIdQuery = r.db(db)
      .table(table)
      .get(id);

    function throwErrorIfCampusNotFound(_campus) {
      if (_campus === null) {
        throw new errors.CampusNotFoundException();
      } else {
        return _campus;
      }
    }

    function returnCampus(_campus): models.Campus {
      return <models.Campus> _campus;
    }

    return q.run(getCampusByIdQuery)()
      .then(throwErrorIfCampusNotFound)
      .then(returnCampus);
  }

  /**
   * Returns an array of all the campuses.
   *
   * @return {Promise<models.Campus[]>} Array of campuses.
   */
  export function getCampusList() : Promise<models.Campus[]> {
    var getAllCampusesQuery = r.db(db)
      .table(table)
      .getAll();

    function returnCampusList(_campusList) : models.Campus[] {
      return <models.Campus[]> _campusList;
    }

    return q.run(getAllCampusesQuery)()
      .then(returnCampusList);
  }
}
export = CampusService;
