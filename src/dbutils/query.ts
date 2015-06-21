import Promise = require('bluebird');
import r = require('rethinkdb');
import connections = require('./connection-pool');

module Query {
  export function run<T>(expr: r.Operation<T>) {
    return () => {
      return _run(expr);
    }
  }

  function _run<T>(expr: r.Operation<T>) {
    return Promise.using<r.Connection>(connections.conn(), (conn) => {
      return expr.run(conn);
    });
  }
}

export = Query
