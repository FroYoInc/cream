import Promise = require('bluebird')
import bcrypt = require('bcrypt')
import config = require('../config');
import errors = require('../errors/errors');

module Utils {
  export function genSalt():Promise<string> {
    return new Promise<string>((resolve, reject) => {
      bcrypt.genSalt(config.Config.password.salt.rounds, (err, result) => {
        if (err) {
          reject(new errors.BcryptSaltError(err.message));
        } else {
          resolve(result);
        }
      });
    });
  }

  export function hash(data: string, salt: string):Promise<string> {
    return new Promise<string>((resolve, reject) => {
      bcrypt.hash(data, salt, (err, result) => {
        if (err) {
          reject(new errors.BcryptHashError(err.message));
        } else {
          resolve(result);
        }
      });
    });
  }
}

export = Utils;
