import Promise = require('bluebird');
import v = require('./validation');
import errors = require('../errors/errors');

module Validation {
	export class UserNameValidator extends v.Validator {
		private userNameRegex = /^[a-zA-Z0-9_.]{1,}$/;

		public isValid(email: string) : Promise<boolean> {
			return new Promise<boolean>((resolve, reject) => {
					email = email.trim();

					if (email.length == 0) {
						reject(new errors.UserNameValidationException('The user name cannot be empty.'));
						return;
					}

					if (email.match(this.userNameRegex) === null) {
						reject(new errors.UserNameValidationException('The user name is not valid.'));
						return;
					}

					resolve(true);
				});
		}
	}
}