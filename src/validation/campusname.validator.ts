/// <reference path="../../typings/bluebird/bluebird.d.ts"/>
import Promise = require('bluebird');
import v = require('./validation');
import errors = require('../errors/errors');

module Validation {
  /**
   * Email validator.
   */
  export class CampusNameValidator implements v.Validator {

    /**
     * Determines whether the campus name is valid
     *
     * @param  {string}           name The campus name to validate.
     * @return {Promise<boolean>}       Returns a Promise<boolean>.
     */
    public isValid(campusName: string) : Promise<boolean> {
      return new Promise<boolean>((resolve, reject) => {
        if (campusName != null && campusName.trim().length > 0) {
          resolve(true);
        } else {
          reject(new errors.CarpoolNameValidationException());
        }
      });
    }
  }
}

export = Validation;
