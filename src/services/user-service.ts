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

  export function createUser(firstName:string, lastName:string,
     userName:string, email:string) {

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

    return emailValidator.isValid(email)
      .then(q.run(userCreateQuery))
      .then((result) => {
        console.log(result);
        if (result.generated_keys.length != 1) {
          throw new Error("expected only 1 object to be created");
        }
        user.id = result.generated_keys[0];
        return user;
      });
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
