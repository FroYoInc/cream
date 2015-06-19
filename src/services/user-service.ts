/// <reference path="../models/User"/>

import Promise = require('bluebird');
import email = require('./email-service');
import pool = require('../dbutils/connection-pool');

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
    return pool.acquire()
      .then(pool.release)
      .then(() => {
        throw new Error("user already exist");
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
