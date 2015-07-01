import Promise = require('bluebird');
import v = require('./validation');
import errors = require('../errors/errors');
import config = require('../config');

module Validation {
	/**
	 * User name validator.
	 */
	export class UserNameValidator implements v.Validator {

		/**
		 * The regular expression validating user names.
		 * @type {RegExp}
		 */
		private userNameRegex = /^[a-zA-Z0-9_.]{1,}$/;

		/**
		 * The minimum length of a user name.
		 * @type {number}
		 */
		private minUserNameLength: number;

		/**
		 * The maximum length of a user name.
		 * @type {number}
		 */
		private maxUserNameLength: number;

		/**
		 * Initializes the validator.
		 * @param  {number} minLength The minimum user name length.
		 * @param  {number} maxLength The maximum user name length.
		 */
		constructor(minLength?: number, maxLength?: number) {
			this.minUserNameLength = typeof minLength !== 'undefined' ? minLength: -1;
			this.maxUserNameLength = typeof maxLength !== 'undefined' ? maxLength: -1;
		}

		/**
		 * Determines whether the user name is valid.
		 * @param  {string}           userName The user name.
		 * @return {Promise<boolean>}          A Promise.
		 */
		public isValid(userName: string) : Promise<boolean> {
			return new Promise<boolean>((resolve, reject) => {

					if (userName.trim().length == 0) {
						reject(new errors.UserNameValidationException('The user name cannot be empty.'));
						return;
					}
 					else if (userName.match(this.userNameRegex) === null) {
						reject(new errors.UserNameValidationException('The user name is not valid.'));
						return;
					}
					else if (userName.length < this.getMinUserNameLength()) {
						reject(new errors.UserNameValidationException('The user name must be at least ' + this.getMinUserNameLength() + ' characters long.'));
						return;
					}
					else if (userName.length > this.getMaxUserNameLength()) {
						reject(new errors.UserNameValidationException('The user name must not be longer than ' + this.getMinUserNameLength() + ' characters.'));
						return;
					}

					resolve(true);
				});
		}

		/**
		 * Returns the minimum user name length.
		 * @return {number} The minimum user name length.
		 */
		private getMinUserNameLength(): number {
			if (this.minUserNameLength < 0) {
				return config.Config.validator.minUserNameLength;
			}

			return this.minUserNameLength;
		}

		/**
		 * Returns the maximum user name length.
		 * @return {number} The maximum user name length.
		 */
		private getMaxUserNameLength(): number {
			if (this.maxUserNameLength < 0) {
				return config.Config.validator.maxUserNameLength;
			}

			return this.maxUserNameLength;
		}
	}
}

export = Validation;
