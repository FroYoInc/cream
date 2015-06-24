import userService = require('../../src/services/user-service');
import Migrator = require('../../src/dbutils/migrator');
import c = require('../../src/config');
import pool = require('../../src/dbutils/connection-pool');
import q = require('../../src/dbutils/query');
import errors = require('../../src/errors/errors');
import models = require('../../src/models/models');
var m = new Migrator.Migrator();

beforeAll((done) => {
  m.migrate(c.Config.db)
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
  function createUser(f, l, u, e, p) {
    return () => {
      return userService.createUser(f, l, u, e)
    }
  }
  function doesUserExist(u) {
    return () => {
      return userService.doesUserExist(u);
    }
  }

  it('should create a user', (done) => {
    doesUserExist('testUser')()
      .then(testFalse)
      .then(createUser('_', '_', 'testUser', '_', '_'))
      .then(doesUserExist('testUser'))
      .then(testTrue)
      .error(fail)
      .catch(fail)
      .finally(done)
  });

  it('should not create user if userName exist', (done) => {
    createUser('_', '_', 'orio0', 'a@example.com', '_')()
      .then(createUser('_', '_', 'orio0', 'b@example.com', '_'))
      .catch(errors.UserExistException, done)
      .then(fail)
      .error(fail)
      .catch(fail)
      .finally(done);
  });

  it('should not create user if email exist', (done) => {
    createUser('_', '_', 'foo', 'foo@example.com', '_')()
      .then(createUser('_', '_', 'bar', 'foo@example.com', '_'))
      .catch(errors.EmailExistException, done)
      .then(fail)
      .catch(fail)
      .error(fail)
      .finally(done);
  })

  it('should return user given user id', (done) => {
    var user: models.User;
    createUser('_', '_', 'orio1', 'c@example.com', '_')()
      .then((_user) => {
        user = _user;
        return _user.id;
      })
      .then(userService.getUserById)
      .then((_user) => {
        expect(user.id).toBe(_user.id);
        expect(user.userName).toBe(_user.userName);
        expect(user.email).toBe(_user.email);
      })
      .catch(fail)
      .error(fail)
      .finally(done)
  });

  xit('should activate a user', (done) => {
    done();
  });
});
