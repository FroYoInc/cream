import userService = require('../../src/services/user-service');
import Migrator = require('../../src/dbutils/migrator');
import c = require('../../src/config');
import pool = require('../../src/dbutils/connection-pool');
import q = require('../../src/dbutils/query');
import errors = require('../../src/errors/errors');
import models = require('../../src/models/models');
import utils = require('../utils');
import uuid = require('uuid');
import r = require('rethinkdb');

enum Caught {Yes};

beforeEach(() => {
  // This is set so the email service used within user service does not
  // actually attempt to send an email.
  userService.setEmailTransportConfig({
    send: (mail, callback) => {
      callback();
    }
  });
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
  function _catch() {return Caught.Yes}
  function checkCaught(arg: Caught) {
    if (arg !== Caught.Yes) {
      fail(new Error("Expected an exception to be caught"))
    }
  }
  function createUser(f, l, u, e, p, s) {
    return () => {
      return userService.createUser(f, l, u, e, p, s)
    }
  }
  function activateUser(code: string) {
    return () => {return userService.activateUser(code)}
  }
  function doesUserExist(u) {
    return () => {
      return userService.doesUserExist(u);
    }
  }

  var rs = utils.rs;
  var em = utils.em;

  it('should create a user', (done) => {
    doesUserExist('testUser')()
      .then(testFalse)
      .then(createUser('_', '_', 'testUser', em(), '_', '_'))
      .then(doesUserExist('testUser'))
      .then(testTrue)
      .error(fail)
      .catch(fail)
      .finally(done)
  });

  it('should not create user if userName exist', (done) => {
    createUser(
      '_', '_', 'orio0', em(), '_', '_')()
      .then(createUser(
        '_', '_', 'orio0', em(), '_', '_'))
      .catch(errors.UserExistException, done)
      .then(fail)
      .error(fail)
      .catch(fail)
      .finally(done);
  });

  it('should not create user if email exist', (done) => {
    var email = em();
    createUser('_', '_', 'foo', email, '_', '_')()
      .then(createUser(
        '_', '_', 'bar', email, '_', '_'))
      .catch(errors.EmailExistException, done)
      .then(fail)
      .catch(fail)
      .error(fail)
      .finally(done);
  })

  it('should return user given user id', (done) => {
    var user: models.User;
    createUser('_', '_', 'orio1', em(), '_', '_')()
      .then((_user) => {
        user = _user;
        return _user.id;
      })
      .then(userService.getUserById)
      .then((_user) => {
        expect(user).toEqual(_user);
      })
      .catch(fail)
      .error(fail)
      .finally(done)
  });

  it('should return user given email', (done) => {
    var user: models.User;
    var email = em();
    function getUserByEmail(email) {
      return () => {
        return userService.getUserByEmail(email);
      }
    }
    getUserByEmail(email)()
      .catch(errors.UserNotFoundException, _catch)
      .then(checkCaught)
      .then(createUser(rs(), rs(), rs(), email, rs(), rs()))
      .then((_user) => { user = _user})
      .then(getUserByEmail(email))
      .then((_user) => {
        expect(user).toEqual(_user);
      })
      .catch(fail)
      .error(fail)
      .finally(done)
  });

  it('should return user given userName', (done) => {
    var user: models.User;
    var userName = rs();
    function getUserByUserName(email) {
      return () => {
        return userService.getUserByUserName(userName);
      }
    }
    getUserByUserName(userName)()
      .catch(errors.UserNotFoundException, _catch)
      .then(checkCaught)
      .then(createUser(rs(), rs(), userName, em(), rs(), rs()))
      .then((_user) => { user = _user})
      .then(getUserByUserName(userName))
      .then((_user) => {
        expect(user).toEqual(_user);
      })
      .catch(fail)
      .error(fail)
      .finally(done)
  });

  it('should activate a user', (done) => {
    var user:models.User;
    var activationCode:string;
    function findUserActivationCode(_user:models.User) {
      return utils.findUserActivationCode(_user)
        .then((ac) => {activationCode = ac;})
        .return(_user);
    }
    createUser(rs(), rs(), rs(), em(), rs(), rs())()
      .then((_user) => {
        expect(_user.isAccountActivated).toBe(false);
        user = _user;
        return _user;
      })
      .then(findUserActivationCode)
      .then(activateUser('invalidactivationcode'))
      .catch(errors.InvalidActivationCodeException, _catch)
      .then(checkCaught)
      .then(() => {return activateUser(activationCode)()})
      .then(() => {return userService.getUserById(user.id)})
      .then((_user) => {
        expect(_user.isAccountActivated).toBe(true);
        expect(_user.id).toBe(user.id);
        return _user;
      })
      .then(() => {return activateUser(activationCode)()})
      .catch(errors.UserAlreadyActivatedException, _catch)
      .then(checkCaught)
      .catch(fail)
      .error(fail)
      .finally(done);
  });

  it("should resend an activation code", (done) => {
    createUser(rs(), rs(), rs(), em(), rs(), rs())()
    .then((user) => {
      userService.resendActivationEmail(user.email)
      .then( (result) => {
        expect(result).toBeTruthy();
      })
      .catch(errors.UserDataNotFound, fail)
      .catch(errors.UserAlreadyActivatedException, fail)
      .finally(done);

    });
  });

});
