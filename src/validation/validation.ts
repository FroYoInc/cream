/// <reference path="../../typings/bluebird/bluebird.d.ts"/>

module Validation {
  export interface Validator {
    isValid(str: string): Promise<boolean>
  }
}

export = Validation;
