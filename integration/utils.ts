import r = require('rethinkdb');
import uuid = require('uuid');
import q = require('../src/dbutils/query');
import models = require('../src/models/models')

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

  export function rs() {return uuid.v4();}
  export function em() {return rs() + '@example.com';}
}
export = Utils;
