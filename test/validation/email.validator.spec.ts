import EmailValidator = require('../../src/validation/email.validator');
import errors = require('../../src/errors/errors');

describe('Email Validator', () => {

  var validator : EmailValidator.EmailValidator;
  var whitelistDomains = ['froyo.com', 'subdomain.froyo.com'];
  var invalidDomains = ['gmail.com', 'somewhereelse.com', 'icecream.com'];
  var accountNames = ['test.user', 'employee', 'Another_Us.er', 'first+last'];

  beforeEach(() => {
    validator = new EmailValidator.EmailValidator(whitelistDomains);
  });

  var expectTrue = (result: any) => {
    expect(result).toBeTruthy();
  };

  var expectFalse = (result: any) => {
    expect(result).toBeFalsy();
  };

  var doNothing = () => {
    // Really... do nothing.
  };

  function getEmailList(accountNames: Array<string>, domains: Array<string>) : Array<string> {
    var emailAddresses : Array<string> = [];

    accountNames.forEach(accountName => {
      domains.forEach(domain => {
        emailAddresses.push(accountName + '@' + domain);
      });
    });

    return emailAddresses;
  }

  it('should allow email addresses with a domain on the whitelist', (done) => {

    var emailAddresses : Array<string> = getEmailList(accountNames, whitelistDomains);

    emailAddresses.forEach(emailAddress => {
      validator.isValid(emailAddress)
        .then(expectTrue)
        .catch(errors.EmailValidationException, fail)
        .error(fail)
        .finally(() => {
          if (emailAddress != emailAddresses[emailAddresses.length - 1]) {
            return;
          }

          done();
        });
    });
  });

  it('should not allow email addresses with a domain not on the whitelist', (done) => {

    var emailAddresses = getEmailList(accountNames, invalidDomains);

    emailAddresses.forEach(emailAddress => {
      validator.isValid(emailAddress)
        .then(result => {
          if (!result) {
            return;
          }

          // If result is true, then it was accepted... Which is bad.
          fail();
          done();
        })
        .catch(errors.EmailValidationException, doNothing)
        .error(doNothing)
        .finally(() => {
          if (emailAddress != emailAddresses[emailAddresses.length - 1]) {
            return;
          }

          done();
        });
    });
  });

  it('should not allow email addresses with a domain on the whitelist that is not complete', (done) => {

    var emailAddresses = getEmailList([''], whitelistDomains);

    emailAddresses.forEach(emailAddress => {
      validator.isValid(emailAddress)
        .then(result => {
          if (!result) {
            return;
          }

          // If result is true, then it was accepted... Which is bad.
          fail();
          done();
        })
        .catch(errors.EmailValidationException, doNothing)
        .error(doNothing)
        .finally(() => {
          if (emailAddress != emailAddresses[emailAddresses.length - 1]) {
            return;
          }

          done();
        });
    });
  })
});
