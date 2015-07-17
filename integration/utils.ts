import r = require('rethinkdb');
import uuid = require('uuid');
import Promise = require('bluebird');
import q = require('../src/dbutils/query');
import models = require('../src/models/models')
import config = require('../src/config');
import userSvc = require('../src/services/user-service');

module Utils {
  export enum Caught {Yes};
  export function _catch() {return Caught.Yes}
  export function checkCaught(arg: Caught) {
    if (arg !== Caught.Yes) {
      fail(new Error("Expected an exception to be caught"))
    }
  }
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

  function createRandomUser():Promise<models.User> {
    return userSvc.createUser('_', '_', rs(), em(), '_', '_');
  }

  var user:models.User;
  export function getSomeUser():Promise<models.User> {
    return new Promise<models.User>((resolve, reject) => {
      if (user != null) {
        resolve(user);
      } else {
        createRandomUser()
          .tap((_user) => {
            user = _user;
            resolve(user);
          })
          .catch(reject)
          .error(reject);
      }
    });
  }
}
export = Utils;
