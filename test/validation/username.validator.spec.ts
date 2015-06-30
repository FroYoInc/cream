import UserNameValidator = require('../../src/validation/username.validator');

describe('Username validator', () => {

	var validator : UserNameValidator.UserNameValidator;

	beforeEach(() => {
		validator = new UserNameValidator.UserNameValidator();
	});

	it('should reject empty user names', () => {
		validator.isValid('').done((result) => {
				expect(result).toBeTruthy();
			});
	});
});