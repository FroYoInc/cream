import r = require('rethinkdb');
import userService = require('../../src/services/user-service');
import Migrator = require('../../src/dbutils/migrator');
import c = require('../../src/config');
import pool = require('../../src/dbutils/connection-pool');
import q = require('../../src/dbutils/query');
var m = new Migrator.Migrator();

var conn : r.Connection;

var createIndexQuery = r.db('froyo')
  .table('users')
  .indexCreate('userName');

beforeAll((done) => {
  m.migrate(c.Config.db)
    .then(q.run(createIndexQuery))
    .then(done)
    .error(done)
});

afterAll((done) => {
  pool.drain()
    .then(done)
    .error(done);
});

describe('UserService', () => {
  var fail = (error) => {expect(error).toBeUndefined();}
  var testTrue = (result) => {expect(result).toBe(true);}
  var testFalse = (result) => {expect(result).toBe(false);}

  it('should create a user', (done) => {
    var userName = 'testUser';
    var userNotExistQuery =  r.db('froyo')
      .table('users')
      .getAll(userName, {index: 'userName'})
      .isEmpty();

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

    q.run(userNotExistQuery)()
      .then(testTrue)
      .then(createUser)
      .then(console.log)
      .then(q.run(userNotExistQuery))
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
