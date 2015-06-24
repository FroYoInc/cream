import Promise = require('bluebird');
import r = require('rethinkdb');
import uuid = require('uuid');
import email = require('./email-service');
import EmailValidator = require('../validation/email.validator');
import q = require('../dbutils/query');
import models = require('../models/models');
import errors = require('../errors/errors');

var emailValidator = new EmailValidator.EmailValidator();

module UserService {

  // export function updateUser(_user: User): User {
  //   // TODO: implement
  //   return new User();
  // }

  var db = 'froyo';
  var table = 'users';
  var userDataTable = 'userData';
  var userNameIndex = 'userName';
  var emailIndex = 'email';

  function userCreateQuery (user) {
    return r.db(db)
      .table(table)
      .insert(user);
  }

  function userExistQuery(userName) {
    return r.db(db)
      .table(table)
      .getAll(userName, {index: userNameIndex})
      .isEmpty().not();
  }

  function emailExistQuery(email) {
    return r.db(db)
      .table(table)
      .getAll(email, {index: emailIndex})
      .isEmpty().not();
  }

  export function doesUserExist(userName: string): Promise<boolean> {
    return q.run(userExistQuery(userName))()
      .then((result) => {
        return result === true
      });
  }

  export function createUser(firstName:string, lastName:string,
     userName:string, email:string): Promise<models.User> {

     var user: models.User = {
       firstName: firstName,
       lastName: lastName,
       userName: userName,
       email: email,
       isAccountActivated: false
     }

    var doesUserOrEmailExistQuery = userExistQuery(userName)
      .or(emailExistQuery(email));

    var returnError = r.branch(
      userExistQuery(userName), r.expr('user exist'), r.expr('email exist'));
    var createUserIfUserOrEmailDoesNotExistQuery =
      r.branch(doesUserOrEmailExistQuery, returnError, userCreateQuery(user));

    function throwErrorIfUserExistOrEmailExist(result)  {
      if (result === 'user exist') {
        throw new errors.UserExistException("user already exist");
      } else if (result === 'email exist') {
        throw new errors.EmailExistException("email already exist");
      } else {
        return result;
      }
    }

    var createUserIfUserOrEmailDoesNotExist =
      q.run(createUserIfUserOrEmailDoesNotExistQuery);

    function setUserID(result) {
      if (result.generated_keys.length != 1) {
        throw new Error("expected only 1 object to be created");
      }
      user.id = result.generated_keys[0];
      return user;
    }

    function generateAndSaveActivationCode(user: models.User) {
      var activationCode = uuid.v4();
      var userData = {
        id: user.id,
        activationCode: activationCode
      }
      var setActivationQuery = r.db(db)
        .table(userDataTable)
        .insert(userData);
      return q.run(setActivationQuery)().return(user);
    }

    return emailValidator.isValid(email)
      .then(createUserIfUserOrEmailDoesNotExist)
      .then(throwErrorIfUserExistOrEmailExist)
      .then(setUserID)
      .then(generateAndSaveActivationCode);
  }

  export function getUserById(id: string): Promise<models.User> {
    var getUserByIdQuery = r.db(db)
      .table(table)
      .get(id);

    function throwErrorIfUserNotFound(_user) {
      if (_user === null) {
        throw new errors.UserNotFoundException()
      } else {
        return _user;
      }
    }

    function returnUser(_user): models.User {
      return <models.User> _user;
    }

    return q.run(getUserByIdQuery)()
      .then(throwErrorIfUserNotFound)
      .then(returnUser)
  }

  // getUserByEmail(id: string): User {
  //   // TODO: implement
  //   return new User();
  // }
  //
  // getUserByUserName(id: string): User {
  //   // TODO: implement
  //   return new User();
  // }
  //
  //
  // activateUser(id: string, activationCode: string): boolean {
  //   // TODO: implement
  //   return false;
  // }
}

export = UserService;
