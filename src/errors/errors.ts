module Errors {
 declare class Error {
    public name: string;
    public message: string;
    public stack: string;
    constructor(message?: string);
  }

  class Exception extends Error {
    constructor(message: string, name: string) {
      super(message);
      this.name = name;
      this.message = this.name + ': ' + message;
      this.stack = (<any>new Error()).stack;
    }
  }
  export class UserExistException extends Exception {
    constructor() {
      super('user already exist', 'UserExistException');
    }
  }
  export class EmailExistException extends Exception {
    constructor() {
      super('email already exist', 'EmailExistException');
    }
  }
  export class UserNotFoundException extends Exception {
    constructor() {
      super('user not found', 'UserNotFoundException');
    }
  }
  export class InvalidActivationCodeException extends Exception {
    constructor() {
      super('invalid activation code', 'InvalidActivationCodeException');
    }
  }
  export class UserAlreadyActivatedException extends Exception {
    constructor() {
      super('user already activated', 'UserAlreadyActivatedException');
    }
  }
  export class ActivationCodeSendException extends Exception {
    constructor(message : string) {
      super(message, 'ActivationCodeSendException');
    }
  }
  export class TestException extends Exception {
    constructor() {
      super('test exception', 'TestException');
    }
  }
  export class UndefinedUserObject extends Exception {
    constructor(){
      super("Used object is undefined.", 'UndefinedUserObject');
    }
  }
  export class InvalidUserObject extends Exception {
    constructor(){
      super("User Object is missing one or more required fields",
      'InvalidUserObject');
    }
  }
  export class SessionUserID extends Exception {
    constructor(){
      super("Session userID is undefined.", 'SessionUserID');
    }
  }

  export class UserDataNotFound extends Exception {
    constructor(){
      super("No user data found for the corresponding user ID",
      'UserDataNotFound');
    }
  }

  export class BcryptSaltError extends Exception {
    constructor(message: string){
      super(message, 'BcryptSaltError');
    }
  }

  export class BcryptHashError extends Exception {
    constructor(message: string){
      super(message, 'BcryptHashError');
    }
  }
}
export = Errors
