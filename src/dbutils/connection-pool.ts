/// <reference path="../../typings/bluebird/bluebird.d.ts"/>
import r = require('rethinkdb');
import Promise = require('bluebird');
import genericPool = require('generic-pool');
import c = require('../config');

module DBUtils {
  var _pool = genericPool.Pool({
    name: 'rethinkdb',
    create: (cb) => {
      r.connect(c.Config.db)
        .then((conn) => {
          cb(null, conn);
        })
        .error((reason) => {
          cb(reason, null);
        })
    },

    destroy: (conn) => {
      conn.close();
    },
    max: 8,
    min: 2,
    log: false
  });

  export function acquire() {
    return new Promise<r.Connection>((resolve, reject) => {
      _pool.acquire((err, conn) => {
        if (err) {
          reject(new Error(err));
        } else {
          resolve(conn);
        }
      });
    })
  }

  export function release(c: r.Connection) {
    return _pool.release(c);
  }
}

export = DBUtils;
