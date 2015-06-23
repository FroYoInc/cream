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

  export class UserExistException extends Error {
  }

  export class TestException extends Error {
  }
}
export = Errors
