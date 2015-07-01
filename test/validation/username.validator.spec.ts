import UserNameValidator = require('../../src/validation/username.validator');
import errors = require('../../src/errors/errors');

describe('Username validator', () => {

	var validator : UserNameValidator.UserNameValidator;
	var minLength : number = 3;
	var maxLength : number = 80;

	beforeEach(() => {
		validator = new UserNameValidator.UserNameValidator(minLength, maxLength);
	});

	var expectFalse = (result: any) => {
		expect(result).toBeFalsy();
	};

	var expectTrue = (result: any) => {
		expect(result).toBeTruthy();
	};

	var doNothing = () => {
		// Yup... do nothing.
	};

	function str_repeat(str: string, length: number) : string {
		var result = '';

		for (var i = 0; i < length; i++) {
			result += str;
		}

		return result;
	}

	it('should reject empty an empty string', (done) => {
		validator.isValid('')
			.then(expectFalse)
			.catch(errors.UserNameValidationException, done)
			.finally(done);
	});

	it('should reject a string of spaces', (done) => {
		validator.isValid('        ')
			.then(expectFalse)
			.catch(errors.UserNameValidationException, done)
			.finally(done);
	});

	it('should reject special characters', (done) => {

		var specialChars = ['~', '`', '!', '@', '#', '$', '%', '^','&', '*', '(', ')', '[', ']'];
		var validName = 'froyo{replaceme}';

		validator.isValid(validName.replace('{replaceme}', ''))
			.then(expectTrue)
			.then(() => {
				specialChars.forEach(char => {
					validator.isValid(validName.replace('{replaceme}', char))
						.then(expectFalse)
						.catch(errors.UserNameValidationException, doNothing);
				});
			})
			.catch(errors.UserNameValidationException, () => {
				fail();
				done();
			})
			.finally(done);
	});

	it('should reject a user name that is too short', (done) => {
		var shortName = str_repeat('f', minLength - 1);

		expect(shortName.length).toEqual(minLength - 1);

		validator.isValid(shortName)
			.then(expectFalse)
			.catch(errors.UserNameValidationException, done)
			.finally(done);
	});

	it('should reject a user name that is too long', (done) => {
		var longName = str_repeat('f', maxLength + 1);

		expect(longName.length).toEqual(maxLength + 1);

		validator.isValid(longName)
			.then(expectFalse)
			.catch(errors.UserNameValidationException, done)
			.finally(done);
	});

	it('should allow user names of the shortest length allowable', (done) => {
		var shortName = str_repeat('f', minLength);

		expect(shortName.length).toEqual(minLength);

		validator.isValid(shortName)
			.then(expectTrue)
			.catch(errors.UserNameValidationException, fail)
			.error(fail)
			.finally(done);
	});

	it('should allow user names of the longest length allowable', (done) => {
		var longName = str_repeat('f', maxLength);

		expect(longName.length).toEqual(maxLength);

		validator.isValid(longName)
			.then(expectTrue)
			.catch(errors.UserNameValidationException, fail)
			.error(fail)
			.finally(done);
	});

	it('should allow valid names', (done) => {
		var names = ['froyo', 'fro.yo', 'fro_yo', 'validname', 'stillvalid...', 'evenNumb3rs', 'LotsOfNumbers0123456789'];

		names.forEach(name => {
			validator.isValid(name)
				.then(expectTrue)
				.catch(errors.UserNameValidationException, fail)
				.error(fail)
				.finally(() => {
					if (name != names[names.length - 1]) {
						return;
					}

					done();
				});
		});
	});
});
