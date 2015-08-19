export class Config {
  static db = {
    'host': 'localhost',
    'port': 28015
  };
  static app = {
    'port': 8080,
    'baseurl' : 'http://localhost',
    'activationUrl': 'http://localhost:3000/api/activate/',
    'loginPath': '/#/validActivation',
    'invalidActivationPath': '/#/invalidActivation'
  };

  static statsd = {
    'host': '107.170.251.172',
    'port': 8125
  };


  static password = {
    salt: {
      rounds: 10
    }
  };
  /*
    The maximum number of login attempts and the amount of time
    to lock the account in minutes.
   */
  static loginLock = {
    max: 5,
    lockoutTime: 30 * 60000 // Num of minutes times ms in a minute
  };

  static activationLock = 5 * 60000; // Num of minutes times ms in a minute
  /**
   * Validator specific configurations, should be moved elsewhere so they can be managed by an administrator.
   */
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
    port: 8081,
    host: 'localhost',
    secure: false,
    name: 'Corpool',
    auth: {
      user: 'no-reply@froyo.com',
      pass: 'froyo'
    },
    ignoreTLS: true
  };

  static docs = {
    dir:"./swagger",
    defaultFile:"index.html"
  }
}
