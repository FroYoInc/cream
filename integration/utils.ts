import r = require('rethinkdb');
import uuid = require('uuid');
import Promise = require('bluebird');
import q = require('../src/dbutils/query');
import models = require('../src/models/models')
import config = require('../src/config');
import userSvc = require('../src/services/user-service');
import carpoolSvc = require('../src/services/carpool.svc');
import campusSvc = require('../src/services/campus.svc');

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

  export function createRandomUser():Promise<models.User> {
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

  function rn():number {return Math.random()};
  function raddr():models.Address {
    return {
      address: rs(),
      geoCode: {lat: rn(), long: rn()}
    };
  }

  function createRandomCampus():Promise<models.Campus> {
    return campusSvc.createCampus(rs(), raddr());
  }

  var campus:models.Campus;
  export function getSomeCampuse():Promise<models.Campus> {
    return new Promise<models.Campus>((resolve, reject) => {
      if (campus != null) {
        resolve(campus);
      } else {
        createRandomCampus()
          .tap((_campus) => {
            campus = _campus;
            resolve(campus);
          })
          .catch(reject)
          .error(reject);
      }
    });
  }

  function createRandomCarpool():Promise<models.Carpool> {
    var owner:models.User;
    var campus:models.Campus;
    return Promise.resolve()
      .then(() => {
        var p1 = getSomeUser();
        var p2 = getSomeCampuse();
        return [p1, p2];
      })
      .spread((_owner:models.User, _campus:models.Campus) => {
        owner = _owner; campus = _campus;
      })
      .then(() => {
        return carpoolSvc.createCarpool(
          rs(), campus.name, rs(), owner.userName, gra());
      });
  }

  var carpool:models.Carpool;
  export function getSomeCarpool():Promise<models.Carpool> {
    return new Promise<models.Carpool>((resolve, reject) => {
      if (carpool != null) {
        resolve(carpool);
      } else {
        createRandomCarpool()
          .tap((_carpool) => {
            carpool = _carpool;
            resolve(carpool);
          })
          .catch(reject)
          .error(reject);
      }
    });
  }

  export function getNonExistantUser():models.User {
    return {
      firstName: rs(),
      lastName: rs(),
      userName: rs(),
      email: em(),
      isAccountActivated: (Math.random() > 0.5),
      carpools: [],
      passwordHash: rs(),
      salt: rs(),
      id: rs()
    }
  }

  export function gra():models.Address {
    return {
      address: "1825 SW Broadway, Portland, OR 97201",
      geoCode: {
        long: -122 + Math.random(),
        lat: 45+Math.random()}
      }
  }
}
export = Utils;
