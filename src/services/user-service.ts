/// <reference path="../models/User"/>

import p = require('bluebird');
import email = require('./email-service');
import ConnectionPool = require('../dbutils/connection-pool');

export class UserService {

  private updateUser(_user: User): User {
    // TODO: implement
    return new User();
  }

  createUser(firstName:string, lastName:string, userName:string, email:string) {
    // TODO: implement
    ConnectionPool.acquire()
      .then((c) => {
        console.log(c);
      })
      .error(console.error);
  }

  getUserByEmail(id: string): User {
    // TODO: implement
    return new User();
  }

  getUserByUserName(id: string): User {
    // TODO: implement
    return new User();
  }

  getUserById(id: string): User {
    return new User();
  }

  activateUser(id: string, activationCode: string): boolean {
    // TODO: implement
    return false;
  }


}
