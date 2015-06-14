/// <reference path="../../typings/rethinkdb/rethinkdb.d.ts"/>

import r = require('rethinkdb');

module DBUtils {
  export class Migrator {
    private _conn : r.Connection;

    private setConn(conn : r.Connection) {
      this._conn = conn;
    }

    private createUserTable() {
      return
    }
    migrate (connOpts : r.ConnectionOptions)  {
      r.connect(connOpts)
        .then(this.setConn)
        .then(this._conn.close)
        .error(console.error);
    }
  }
}
export = DBUtils;
