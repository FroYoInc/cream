import EmailService = require('../../src/services/email-service');
import crypto = require('crypto');
import models = require('../../src/models/models');

describe('Email service integration tests', () => {
  var server;
  var transportConfig : EmailService.EmailConfigOptions;
  var emailService : EmailService.EmailService;
  var user : models.User;
  var mailData: any;

  beforeEach(() => {
    transportConfig = {
      send: (mail, callback) => {
        mailData = mail;
      },
      sendMail: (d, d2) => {

      }
    }

    emailService = new EmailService.EmailService();
    emailService.transportConfig = transportConfig;

    user = {
      id: '4e3iu9012',
      firstName: 'Test',
      lastName: 'User',
      userName: 'testuser',
      email: 'me@froyo4life.com',
      isAccountActivated: false
    };
  });

  it('should be able to send the activation email', () => {
    var activationCode = 'fhjsdBHJFSJKdwe239';

    emailService.sendActivation(user, activationCode).done((value: nodemailer.SentMessageInfo) => {

    }, (error) => {
      fail(error);
    });

    expect(mailData).toBeDefined();
    expect(mailData.message.content).toBeDefined();
    expect(mailData.message.content.indexOf(activationCode)).not.toEqual(-1);
  });
});
