/// <reference path="../../typings/rethinkdb/rethinkdb.d.ts"/>

import r = require('rethinkdb');

module DBUtils {
  conn : r.;
  export class Migrator {
    migrate () {
      console.log('migrate');
    }
  }
}
export = DBUtils;
