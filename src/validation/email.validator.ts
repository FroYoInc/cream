/// <reference path="./validation"/>

module Validation {
  export class EmailValidator implements Validator {
    isValid(s: string) {
      return new Promise<boolean>((resolve, reject) => {
        if (s != '') {
          resolve(true);
        } else {
          reject(new Error("email cannot be empty"));
        }
      });
    }
  }
}
