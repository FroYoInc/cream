import EmailService = require('../../src/services/email-service');
import SMTPServer = require('smtp-server');
import crypto = require('crypto');
import models = require('../../src/models/models');

/**
 * The SMTP Server setup portion (done in beforeEach) of this integration test
 * was done through referencing:
 * https://github.com/andris9/Nodemailer/blob/master/test/nodemailer-test.js
 */
var PORT_NUMBER = 8397;

var TEST_SMTP_USER = 'test@froyo4life.com';
var TEST_SMTP_PASS = 'welovefroyo';

describe('Email service integration tests', () => {
  var server;
  var transportConfig : EmailService.EmailConfigOptions;
  var emailService : EmailService.EmailService;
  var user : models.User;

  beforeEach((done) => {
    server = new SMTPServer({
      authMethods: ['PLAIN'],
      disabledCommands: ['STARTTLS'],

      onData: (stream, session, callback) => {
        var hash = crypto.createHash('md5');

        stream.on('data', (chunk) => {
          hash.update(chunk);
        });

        stream.on('end', () => {
          callback(null, hash.digest('hex'));
        });
      },

      onAuth: (auth, session, callback) => {
        if (auth.username !== TEST_SMTP_USER || auth.password !== TEST_SMTP_PASS) {
          return callback(new Error('Invalid SMTP username or password.'));
        }

        callback(null, {
          user: 123
        });
      },

      onMailFrom: (address, session, callback) => {
        if (!/@valid.sender/.test(address.address)) {
          return callback(new Error('Invalid email, must be user@valid.sender to send mail.'));
        }

        return callback();
      },

      onRcptTo: (address, session, callback) => {
        if (!/@valid.recipient/.test(address.address)) {
          return callback(new Error('Invalid email, must be user.valid.recipient to send mail.'));
        }

        return callback();
      },

      logger: false
    });

    transportConfig = {
      host: 'localhost',
      port: PORT_NUMBER,
      auth: {
        user: TEST_SMTP_USER,
        pass: TEST_SMTP_PASS
      },
      ignoreTLS: true,
      name: 'testsend',
      version: '1',
      send: (data, callback) => {
        callback();
      }
    };

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

    server.listen(PORT_NUMBER, done);
  });

  afterEach((done) => {
    server.close(done);
  });

  it('should be able to send the activation email', (done) => {
    emailService.sendActivation(user).done((value: nodemailer.SentMessageInfo) => {
      expect(value.accepted).toEqual([user.email]);
      done();
    }, (error) => {
      fail(error);
      done();
    });
  });
});
