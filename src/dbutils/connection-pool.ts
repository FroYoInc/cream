/// <reference path="../../typings/bluebird/bluebird.d.ts"/>
import r = require('rethinkdb');
import Promise = require('bluebird');
import genericPool = require('generic-pool');
import c = require('../config');

module DBUtils {
  export interface Released {};
  export interface Drained {};

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

  export function conn() {
    var _conn: r.Connection;
    return new Promise<r.Connection>((resolve, reject) => {
      _pool.acquire((err, conn) => {
        if (err) {
          reject(new Error(err));
        } else {
          _conn = conn;
          resolve(conn);
        }
      });
    }).disposer(() => {
      _pool.release(_conn);
    })
  }

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
    return new Promise<Released>((resolve, reject) => {
      _pool.release(c);
      resolve({});
    });
  }

  export function _release(c: r.Connection) {
    return release;
  }

  export function drain() {
    return new Promise<Drained>((resolve, reject) => {
      _pool.drain(() => {
        _pool.destroyAllNow();
        resolve({});
      });
    });
  }
}

export = DBUtils;
