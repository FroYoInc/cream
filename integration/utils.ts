import r = require('rethinkdb');
import uuid = require('uuid');
import q = require('../src/dbutils/query');
import models = require('../src/models/models')
import config = require('../src/config');

module Utils {
  export function findUserActivationCode(_user:models.User) {
    var findUserActivationCodeQuery = r.db('froyo')
      .table('activation')
      .coerceTo('array')
      .filter({'userId': _user.id})
      .nth(0);
    return q.run(findUserActivationCodeQuery)()
      .then((result) => {return result.id})
  }

  export function rs() {return uuid.v4().replace(/-/g, '');}
  function vem() {
    var domainWhiteList = config.Config.validator.domainWhitelist;
    if (domainWhiteList.length == 0) {
      return 'example.com';
    } else {
      return domainWhiteList[0];
    }
  }
  export function em() {return rs() + '@' + vem();}
  export function validEmail(userName) {
    return userName + '@' + vem();
  }
}
export = Utils;
