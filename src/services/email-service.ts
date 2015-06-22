
import models = require('../models/models');
import mailer = require('nodemailer');
import config = require('../config');

/**
 * Email service.
 */
class EmailService {

  /**
   * Sends the activation email to the specified user.
   *
   * @param  {User}    user The user to send the activation email to.
   * @return {boolean}      [description]
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

export = EmailService;
