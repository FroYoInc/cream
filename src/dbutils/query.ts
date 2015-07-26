import Promise = require('bluebird');
import r = require('rethinkdb');
import SDC = require('statsd-client');
import connections = require('./connection-pool');
import config = require('../config');

var sdc = new SDC({host: config.Config.statsd.host});
module Query {
  export function run<T>(query: r.Operation<T>, queryName?: string) {
    return () => {
      if (queryName) {
        return _run(query, queryName);
      } else {
        return _run(query);
      }
    }
  }

  function _run<T>(query: r.Operation<T>, queryName?: string) {
    return Promise.using<r.Connection>(connections.acquire(), (conn) => {
      var start = new Date();
      return query.run(conn)
        // Collect metrics on query time
        .tap(() => {
          if (queryName) {
            sdc.timing('query.'+queryName, start);
          } else {
            sdc.timing('query.unknown', start);
          }
        });
    });
  }
}

export = Query
