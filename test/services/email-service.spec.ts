import EmailService = require('../../src/services/email-service');
import c = require('../../src/config');
import models = require('../../src/models/models');

describe('The Email Service', () => {
  var emailService = null;
  var mockTransportConfig = null;
  var user : models.User;

  beforeEach(() => {
    emailService = new EmailService.EmailService();

    user = {
      id: '4e3iu9012',
      firstName: 'Test',
      lastName: 'User',
      userName: 'testuser',
      email: 'me@froyo4life.com',
      isAccountActivated: false,
      passwordHash: '12345',
      salt: 'NaCl'
    };
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

  it('should send the activation email with the activation code in it', () => {
    var activationCode: string = 'fhjsdBHJFSJKdwe239';
	var mailData: any;
	
	// Override the send function, which will just save the sent message.
	emailService.transportConfig = {
      send: (mail, callback) => {
        mailData = mail;
      }
    };

    emailService.sendActivation(user, activationCode).done((value: nodemailer.SentMessageInfo) => {
		// Good, no error.
    }, (error) => {
      fail(error);
    });

    expect(mailData).toBeDefined();
    expect(mailData.message.content).toBeDefined();
    expect(mailData.message.content.indexOf(activationCode)).not.toEqual(-1);
  });
});
