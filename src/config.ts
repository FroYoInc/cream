export class Config {
  static db = {
    'host': 'localhost',
    'port': 28015
  };

  static app = {
    'port': 8080,
  };

  /**
   * Email options, this is used for now until the administration story.
   * All available options can be found here:
   * https://github.com/andris9/nodemailer-smtp-transport#usage
   *
   * @type {Object}
   */
  static email = {
    port: 465,
    host: 'localhost',
    secure: true,
    auth: {
      user: 'username@gmail.com',
      pass: 'password'
    },
    ignoreTLS: false,
    name: 'Gmail'
  };
}
