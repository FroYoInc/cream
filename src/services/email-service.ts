
import models = require('../models/models');
import mailer = require('nodemailer');
import config = require('../config');
import Promise = require('bluebird');

/**
 * The email service which provides methods to send such things as activation
 * emails.
 */
export class EmailService {

  /**
   * All email configuration options are stored here.
   * @type {mailer.TransporterConfig}
   */
  private _transportConfig: mailer.TransporterConfig;

  /**
   * Initializes the email service instance.
   */
  constructor() {
    this._transportConfig = config.Config.email;
  }

  /**
   * Returns the current transportation configuration options.
   * @return {mailer.TransporterConfig} The email configuration options.
   */
  get transportConfig(): mailer.TransporterConfig {
    return this._transportConfig;
  }

  /**
   * Sets the transportation configuration options.
   * @param  {mailer.TransporterConfig} config The email configuration options.
   */
  set transportConfig(config: mailer.TransporterConfig) {
    this._transportConfig = config;
  }

  /**
   * Sends the activation email to the specified user.
   *
   * @param  {models.User}                         user           The user.
   * @param  {string}                              activationCode Their activation code.
   * @return {Promise<nodemailer.SentMessageInfo>}                A Promise.
   */
  public sendActivation(user: models.User, activationCode: string): Promise<nodemailer.SentMessageInfo> {

    var transporter = this.buildTransporter();


    var mailOptions = {
      from: config.Config.email.name + ' <' + config.Config.email.auth.user + '>',
      to: user.firstName + ' ' + user.lastName + ' <' + user.email + '>',
      subject: 'Activate Your Carpooling Account',
      text: 'Hello ' + user.firstName + ', ' + "\r\n"
            + 'You need to activate your account here: ' + config.Config.app.baseurl + '/activate?code=' + activationCode
    };

    return new Promise<nodemailer.SentMessageInfo>((resolve, reject) => {

      transporter.sendMail(mailOptions, (error, sent) => {
        if (error)
        {
          reject(error);
          return;
        }

        resolve(sent);
      });
    });
  }

  /**
   * Builds an instance of a Transporter to be used with nodemailer to send
   * an email.
   *
   * @return {mailer.Transporter} An instance of Transporter, configured based
   *                              off the SMTP settings.
   */
  private buildTransporter(): mailer.Transporter {
    return mailer.createTransport(this._transportConfig);
  }
}
