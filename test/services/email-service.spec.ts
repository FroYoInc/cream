import EmailService = require('../../src/services/email-service');
import c = require('../../src/config');

describe('The Email Service', () => {
  var emailService = null;
  var mockTransportConfig = null;

  beforeEach(() => {
    emailService = new EmailService.EmailService();
  });

  it('should use default config options', () => {
    expect(emailService.transportConfig).toEqual(c.Config.email);
  });

  it('should allow config options to be changed from the default', () => {

    var emailConfig: EmailService.EmailConfigOptions = {
      host: 'newhost.com',
      port: 999,
      auth: {
        user: 'me@newhost.com',
        pass: 'fakepassword'
      }
    };

    emailService.transportConfig = emailConfig;

    expect(emailService.transportConfig).toEqual(emailConfig);
  });
});
