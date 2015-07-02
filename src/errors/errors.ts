module Errors {
 declare class Error {
    public name: string;
    public message: string;
    public stack: string;
    constructor(message?: string);
  }

  class Exception extends Error {
    constructor(public message: string) {
      super(message);
      this.name = 'Exception';
      this.message = message;
      this.stack = (<any>new Error()).stack;
    }
  }
  export class UserExistException extends Exception {
    constructor() {
      super('user already exist');
    }
  }
  export class EmailExistException extends Exception {
    constructor() {
      super('email already exist');
    }
  }
  export class UserNotFoundException extends Exception {
    constructor() {
      super('user not found');
    }
  }
  export class UserNameValidationException extends Exception {
    constructor(message: string) {
      super(message);
    }
  }
  export class InvalidActivationCodeException extends Exception {
    constructor() {
      super('invalid activation code');
    }
  }
  export class UserAlreadyActivatedException extends Exception {
    constructor() {
      super('user already activated');
    }
  }
  export class ActivationCodeSendException extends Exception {
    constructor(public message : string) {
      super(message);
    }
  }
  export class TestException extends Exception {
    constructor() {
      super('test exception');
    }
  }
  export class UndefinedUserObject extends Exception {
    constructor(){
      super("Used object is undefined.");
    }
  }
  export class InvalidUserObject extends Exception {
    constructor(){
      super("User Object is missing one or more required fields");
    }
  }
  export class SessionUserID extends Exception {
    constructor(){
      super("Session userID is undefined.");
    }
  }

  export class UserDataNotFound extends Exception {
    constructor(){
      super("No user data found for the corresponding user ID");
    }
  }
}
export = Errors
