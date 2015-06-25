
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
   * @type {EmailConfigOptions}
   */
  private _transportConfig: EmailConfigOptions;

  /**
   * Initializes the email service instance.
   */
  constructor() {
    this._transportConfig = config.Config.email;
  }

  /**
   * Returns the current transportation configuration options.
   * @return {EmailConfigOptions} The email configuration options.
   */
  get transportConfig(): EmailConfigOptions {
    return this._transportConfig;
  }

  /**
   * Sets the transportation configuration options.
   * @param  {EmailConfigOptions} config The email configuration options.
   */
  set transportConfig(config: EmailConfigOptions) {
    this._transportConfig = config;
  }

  /**
   * Sends the activation email to the specified user.
   *
   * @param  {models.User}                         user The user object.
   * @return {Promise<nodemailer.SentMessageInfo>}      A Promise.
   */
  public sendActivation(user: models.User): Promise<nodemailer.SentMessageInfo> {

    var transporter = this.buildTransporter();

    // TODO: What URL will be used for activation?
    // TODO: WHere is the activation code?
    var mailOptions = {
      from: '<' + config.Config.email.auth.user + '>',
      to: user.firstName + ' ' + user.lastName + ' <' + user.email + '>',
      subject: 'Activate Your Carpooling Account',
      text: 'Hello ' + user.firstName + ', ' + "\r\n"
            + 'You need to activate your account here: http://somelink.com/activate?id=' + user.id
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
    return mailer.createTransport(config.Config.email);
  }
}

/**
 * The interface for defining authentication options for nodemailer.
 */
export interface EmailConfigAuthOption
{
  /**
   * The user name.
   * @type {string}
   */
  user?: string;

  /**
   * The password.
   * @type {string}
   */
  pass?: string;

  /**
   * The OAuth2 access token.
   * @type {string}
   */
  xoauth2?: string;
}

/**
 * The interface for defining email configuration options for nodemailer.
 *
 * Documentation found here:
 * https://github.com/andris9/nodemailer-smtp-transport#usage
 */
export interface EmailConfigOptions
{
  /**
   * The SMTP port, defaults to 25 or 465.
   * @type {number}
   */
  port?: number;

  /**
   * The SMTP host, defaults to localhost.
   * @type {string}
   */
  host?: string;

  /**
   * Whether the connection should use SSL, true for yes, false for no.
   * @type {boolean}
   */
  secure?: boolean;

  /**
   * The authentication options for the SMTP connection.
   *
   * @type {EmailConfigAuthOption}
   */
  auth?: EmailConfigAuthOption;

  /**
   * Turns off STARTTLS support, if set to true.
   * @type {boolean}
   */
  ignoreTLS?: boolean;

  /**
   * An optional host name, not required.
   * @type {string}
   */
  name?: string;

  /**
   * The local interface to use for network connections.
   * @type {string}
   */
  localAddress?: string;

  /**
   * The number of milliseconds after which attempting to connect to timeout.
   * @type {number}
   */
  connectionTimeout?: number;

  /**
   * The number of milliseconds to wait for the greeting after connection.
   * @type {number}
   */
  greetingTimeout?: number;

  /**
   * The time in milliseconds after which the connection is considered inactive.
   * @type {number}
   */
  socketTimeout?: number;

  /**
   * If set to true, nodemailer will output logs to the console.
   * @type {[type]}
   */
  debug?: boolean;

  /**
   * The preferred authentication method.
   * @type {string}
   */
  authMethod?: string;

  /**
   * Any configuration options to pass to the socket constructor.
   * @type {object}
   */
  tls?: any;

  /**
   * A version.
   * @type {string}
   */
  version?: string;

  /**
   * A send callback.
   * @type {(data: any, callback: () => void) => void}
   */
  send?: (data: any, callback: () => void) => void;
}
