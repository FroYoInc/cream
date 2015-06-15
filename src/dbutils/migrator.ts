/// <reference path="../../typings/rethinkdb/rethinkdb.d.ts"/>

import r = require('rethinkdb');

module DBUtils {

  export class Migrator {
    static dbShape = {
      dbname: 'froyo',
      tables: ['a']
    }
    private _conn : r.Connection;

    private setConnection(conn : r.Connection) {
      this._conn = conn;
    }

    private closeConnection() {
      return this._conn.close();
    }

    private createDatabase() {
      var dbname = Migrator.dbShape.dbname;
      var test = r.dbList().contains(dbname);
      var trueBranch = r.now();
      var falseBranch = r.dbCreate(dbname);
      return r.branch(test, trueBranch, falseBranch).run(this._conn);
    }

    migrate (connOpts : r.ConnectionOptions)  {
      return r.connect(connOpts)
        .then(this.setConnection)
        .then(this.createDatabase)
        .then(this.closeConnection)
    }
  }
}
export = DBUtils;
