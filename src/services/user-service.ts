import Promise = require('bluebird');
import r = require('rethinkdb');
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
  var userNameIndex = 'userName';

  function userCreateQuery (user) {
    return r.db(db)
      .table(table)
      .insert(user);
  }

  function userExistQuery(userName) {
    return r.db(db)
      .table(table)
      .getAll(userName, {index: userNameIndex})
      .isEmpty();
  }

  export function doesUserExist(userName: string): Promise<boolean> {
    return q.run(userExistQuery(userName))()
      .then((result) => {
        return result === false
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

    var falseBranch = r.expr(0).eq(1);
    var createUserIfUserDoesNotExistQuery =
      r.branch(userExistQuery(userName), userCreateQuery(user), falseBranch);

    function checkUserExistance() {
      return doesUserExist(userName);
    }

    function throwErrorIfUserExist(result)  {
      if (result === false) {
        throw new errors.UserExistException("user already exist");
      } else {
        return result;
      }
    }

    var createUserIfUserDoesNotExist = q.run(createUserIfUserDoesNotExistQuery);

    function setUserIDAndReturnUser(result) {
      if (result.generated_keys.length != 1) {
        throw new Error("expected only 1 object to be created");
      }
      user.id = result.generated_keys[0];
      return user;
    }

    return emailValidator.isValid(email)
      .then(createUserIfUserDoesNotExist)
      .then(throwErrorIfUserExist)
      .then(setUserIDAndReturnUser);
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
