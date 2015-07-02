/// <reference path="../../typings/bluebird/bluebird.d.ts"/>
import Promise = require('bluebird');
import v = require('./validation');
import errors = require('../errors/errors');
import config = require('../config');

module Validation {
  /**
   * Email validator.
   */
  export class EmailValidator implements v.Validator {

    /**
     * The regular expression for email addresses... A very simple one.
     * @type {RegExp}
     */
    private emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    /**
     * An array of domain names allowed by the validator.
     * @type {Array<string>}
     */
    public static domainWhitelist : Array<string> = null;

    /**
     * Initializes the Email validator.
     */
    constructor() {
      if (EmailValidator.domainWhitelist == null) {
        EmailValidator.domainWhitelist = config.Config.validator.domainWhitelist;
      }
    }

    /**
     * Determines whether the email address is valid.
     *
     * @param  {string}           email The email address to validate.
     * @return {Promise<boolean>}       Returns a Promise<boolean>.
     */
    public isValid(email: string) : Promise<boolean> {
      return new Promise<boolean>((resolve, reject) => {

        if (email.match(this.emailRegex) === null) {
          reject(new errors.EmailValidationException('The email address is invalid.'));
          return;
        }
        else if (!this.isDomainValid(email)) {
          reject(new errors.EmailValidationException('The email address\'s domain is not allowed.'));
          return;
        }

        resolve(true);
      });
    }

    /**
     * Indicates whether the domain of the email address is allowed.
     * @param  {string}  email The email address.
     * @return {boolean}       Returns true if the domain is on the whitelist,
     *                         false otherwise.
     */
    private isDomainValid(email: string) : boolean {
      if (EmailValidator.domainWhitelist.length == 0) {
        return true;
      }

      var emailDomain = this.getEmailDomain(email);

      for (var index = 0; index < EmailValidator.domainWhitelist.length; index++)
      {
        if (EmailValidator.domainWhitelist[index].toLowerCase() != emailDomain) {
          continue;
        }

        return true;
      }

      return false;
    }

    /**
     * Returns the domain name of the email address.
     * @param  {string} email The email address.
     * @return {string}       The domain name of the email address.
     */
    private getEmailDomain(email: string) : string {
      return email.split('@').pop().toLowerCase();
    }
  }
}

export = Validation;
