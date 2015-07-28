/// <reference path="../../typings/bluebird/bluebird.d.ts"/>
import Promise = require('bluebird');
import v = require('./validation');
import errors = require('../errors/errors');

module Validation {
  /**
   * Email validator.
   */
  export class CarpoolNameValidator implements v.Validator {

    /**
     * Determines whether the carpool name is valid
     *
     * @param  {string}           name The carpool name to validate.
     * @return {Promise<boolean>}       Returns a Promise<boolean>.
     */
    public isValid(carpoolName: string) : Promise<boolean> {
      return new Promise<boolean>((resolve, reject) => {
        if (carpoolName != '') {
          resolve(true);
        } else {
          reject(new errors.CarpoolNameValidationException());
        }
      });
    }
  }
}

export = Validation;
