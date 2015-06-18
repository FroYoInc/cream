import mailer = require('nodemailer');
import config = require('../config');

export class EmailService {

  /**
   * Sends the activation email to the specified user.
   *
   * @param  {User}    user The user to send the activation email to.
   * @return {boolean}      [description]
   */
  public sendActivation(user: User): boolean {

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

    transporter.sendMail(mailOptions);

    return true;
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
