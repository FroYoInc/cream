/// <reference path="../../typings/bluebird/bluebird.d.ts"/>
import r = require('rethinkdb');
import Promise = require('bluebird');

module DBUtils {
  var a = 'asd'
  export function getConnection() {
    return a;
  }
}

export = DBUtils;
