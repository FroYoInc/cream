/// <reference path="../models/User"/>

import p = require('bluebird');
import emailService = require('./email-service');

export class UserService {

  private updateUser(_user: User): User {
    // TODO: implement
    return new User();
  }

  createUser(firstName:string, lastName:string, userName:string, email:string): User {
    // TODO: implement
    return new User();
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
