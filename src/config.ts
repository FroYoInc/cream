export class Config {
  static db = {
    'host': 'localhost',
    'port': 28015
  };

  static app = {
    'port': 8080,
    'baseurl' : 'http://localhost'
  };

  static validator = {
    minUserNameLength: 3,
    maxUserNameLength: 255,
    domainWhitelist: ['froyo.com']
  };

  /**
   * Email options, this is used for now until the administration story.
   * All available options can be found here:
   * https://github.com/andris9/nodemailer-smtp-transport#usage
   *
   * @type {Object}
   */
  static email = {
    //port: 465,
    //host: 'localhost',
    //secure: true,
    name: 'Corpool',
    auth: {
      user: 'some@gmail.com',
      pass: 'password'
    },
    service: 'Gmail',
    //ignoreTLS: false,
  };
}
