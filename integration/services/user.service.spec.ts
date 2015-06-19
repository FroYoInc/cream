import r = require('rethinkdb');
import userService = require('../../src/services/user-service');
import connection = require('../../src/dbutils/connection-pool');
import Migrator = require('../../src/dbutils/migrator');
import c = require('../../src/config');
var m = new Migrator.Migrator();

var conn : r.Connection;

var createIndex = () => {
  return r.db('froyo').table('users')
  .indexCreate('userName')
  .run(conn);
}

beforeAll((done) => {
  m.migrate(c.Config.db)
    .then(connection.acquire)
    .then((_conn) => {conn =_conn})
    .then(createIndex)
    .then(done)
    .error(done)
});

afterAll((done) => {
  connection.release(conn)
    .then(connection.drain)
    .then(done)
    .error(done);
});

describe('UserService', () => {
  var fail = (error) => {expect(error).toBeUndefined();}
  var testTrue = (result) => {expect(result).toBe(true);}
  var testFalse = (result) => {expect(result).toBe(false);}

  it('should create a user', (done) => {
    var userName = 'testUser';
    var runUserNotExistQuery = () => {
      return r.db('froyo')
        .table('users')
        .getAll(userName, {index: 'userName'})
        .isEmpty()
        .run(conn);
    };
    var createUser = () => {
      return userService.createUser('_', '_', userName, '_');
    };

    runUserNotExistQuery()
      .then(testTrue)
      .then(createUser)
      .then(runUserNotExistQuery)
      .then(testFalse)
      .error(fail)
      .finally(done);
  });

  xit('should not create user if user exist', (done) => {
    var userName = 'orio';
    var createUser = () => {
      return userService.createUser('_', '_', userName, '_');
    };
    createUser()
      .error(fail)
      .then(createUser)
      .error(done)
      .then(fail);
  });
});
