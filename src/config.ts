export class Config {
  static db = {
    'host': 'localhost',
    'port': 28015
  };

  static app = {
    'port': 8080,
    'baseurl' : 'http://localhost'
  };

  /*
    The maximum number of login attempts and the amount of time
    to lock the account in minutes.
   */
  static loginLock = {
    max: 5,
    lockoutTime: 30 * 60000 // Num of minutes times ms in a minute
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

  static docs = {
    dir:"./swagger",
    defaultFile:"index.html"
  }
}
