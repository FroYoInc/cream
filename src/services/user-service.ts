/// <reference path="../models/User"/>

import Promise = require('bluebird');
import r = require('rethinkdb');
import email = require('./email-service');
import connections = require('../dbutils/connection-pool');
import EmailValidator = require('../validation/email.validator');
import q = require('../dbutils/query');

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

     var userCreateQuery =  r.db('froyo')
      .table('users')
      .insert({
        'firstName': firstName,
        'lastName': lastName,
        'userName': userName,
        'email': email
      });

    return emailValidator.isValid(email)
      .then(q.run(userCreateQuery))
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
