import Promise = require('bluebird');
import r = require('rethinkdb');
import email = require('./email-service');
import EmailValidator = require('../validation/email.validator');
import q = require('../dbutils/query');
import models = require('../models/models');

var emailValidator = new EmailValidator.EmailValidator();

module UserService {

  // export function updateUser(_user: User): User {
  //   // TODO: implement
  //   return new User();
  // }
  export class UserExistError implements Error {
    name = "UserExistError";
    message = "user already exist"
  }

  export function doesUserExist(userName: string): Promise<boolean> {
    var userExistQuery = r.db('froyo')
      .table('users')
      .getAll(userName, {index: 'userName'})
      .isEmpty();

    return q.run(userExistQuery)()
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

    var userCreateQuery =  r.db('froyo')
      .table('users')
      .insert(user);

    var checkUserExistance = () => {
      return doesUserExist(userName);
    }

    var throwErrorIfUserExist = (userExist) => {
      if (userExist) throw new Error("user already exist");
    }

    var createUser = q.run(userCreateQuery);

    var setUserID = (result) => {
      if (result.generated_keys.length != 1) {
        throw new Error("expected only 1 object to be created");
      }
      user.id = result.generated_keys[0];
      return user;
    }

    return emailValidator.isValid(email)
      .then(checkUserExistance)
      .then(throwErrorIfUserExist)
      .then(createUser)
      .then(setUserID);
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
  // getUserById(id: string): User {
  //   return new User();
  // }
  //
  // activateUser(id: string, activationCode: string): boolean {
  //   // TODO: implement
  //   return false;
  // }
}

export = UserService;
