/// <reference path="../models/User"/>

import Promise = require('bluebird');
import r = require('rethinkdb');
import email = require('./email-service');
import connections = require('../dbutils/connection-pool');
import EmailValidator = require('../validation/email.validator');

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

  function _run(expr: r.Expression<any>) {
    connections.acquire()
      .then((conn) => {
        return expr.run(conn)
          .finally(connections._release(conn))
      })
  };
  export function createUser(firstName:string, lastName:string,
     userName:string, email:string) {

    var _validateEmail = (conn: r.Connection) => {
      return emailValidator.isValid(email)
        .return(conn);
    };

    var _createUser = (conn: r.Connection) => {
      return r.db('froyo')
        .table('users')
        .insert({
          'firstName': firstName,
          'lastName': lastName,
          'userName': userName,
          'email': email
        })
        .run(conn)
        .return(conn);
    };

    return connections.acquire()
      .then(_validateEmail)
      .then(_createUser)
      .then(connections.release);
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
