/// <reference path="../models/User"/>

import p = require('bluebird');
import email = require('./email-service');

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
    /*
    boolean status = false;
    if (activation code && userID is in DB) {
        set _isAccountActivated = true;
        status = true;
    }
     else if (activation code is false)
        console.log("false action code")
     else
        console.log("userID does not exist")


    */
    return status;
  }


}
