import Promise = require('bluebird');
import v = require('./validation');
import errors = require('../errors/errors');

module Validation {
	export class UserNameValidator implements v.Validator {
		private userNameRegex = /^[a-zA-Z0-9_.]{1,}$/;

		public isValid(userName: string) : Promise<boolean> {
			return new Promise<boolean>((resolve, reject) => {
				
					if (userName.trim().length == 0) {
						reject(new errors.UserNameValidationException('The user name cannot be empty.'));
						return;
					}

					if (userName.match(this.userNameRegex) === null) {
						reject(new errors.UserNameValidationException('The user name is not valid.'));
						return;
					}

					resolve(true);
				});
		}
	}
}

export = Validation;