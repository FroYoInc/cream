/// <reference path="../../typings/rethinkdb/rethinkdb.d.ts"/>

import r = require('rethinkdb');

module DBUtils {
  export class Migrator {
    private _conn : r.Connection;

    private setConnection(conn : r.Connection) {
      this._conn = conn;
    }

    private closeConnection() {
      return this._conn.close();
    }

    private createDatabase() {
      var test = r.dbList().contains('froyo');
      var trueBranch = r.now();
      var falseBranch = r.dbCreate('froyo');
      return r.branch(test, trueBranch, falseBranch).run(this._conn);
    }

    migrate (connOpts : r.ConnectionOptions)  {
      var self = this;
      r.connect(connOpts)
        .then(this.setConnection)
        .then(this.createDatabase)
        .then(this.closeConnection)
        .error(console.error);
    }
  }
}
export = DBUtils;
