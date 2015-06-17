/// <reference path="../../typings/rethinkdb/rethinkdb.d.ts"/>
/// <reference path="../../typings/bluebird/bluebird.d.ts"/>

import r = require('rethinkdb');
import p = require('bluebird');
import shapes = require('./shapes');

module DBUtils {
  export class Migrator {
    static dbShape : shapes.DBShape = {
      dbname: 'froyo',
      tables: [{
        tableName: 'users',
        indices: ['userName', 'email']
      }]
    };
    private _conn : r.Connection;

    private setConnection(conn : r.Connection) {
      this._conn = conn;
    }

    private closeConnection() {
      return this._conn.close();
    }

    private branch(test: r.Expression<boolean>,
      tb: r.Expression<any>, fb: r.Expression<any>) {
      return r.branch(test, tb, fb).run(this._conn);
    }

    private createDatabase() {
      var dbname = Migrator.dbShape.dbname;
      var test = r.dbList().contains(dbname);
      var trueBranch = r.now();
      var falseBranch = r.dbCreate(dbname);
      return this.branch(test, trueBranch, falseBranch);
    }

    private createTables() {
      var createTable = (t) => {
        var test = r.db(Migrator.dbShape.dbname).tableList()
          .contains(t.tableName);
        var trueBranch = r.now();
        var falseBranch = r.db(Migrator.dbShape.dbname)
          .tableCreate(t.tableName);
        return this.branch(test, trueBranch, falseBranch);
      }
      return p.map(Migrator.dbShape.tables, createTable);
    }

    private createIndices() {
      console.error("TODO");
    }

    private createAdminAccount() {
      // User userService to create an admin
      console.error("TODO")
    }

    migrate (connOpts : r.ConnectionOptions)  {
      return r.connect(connOpts)
        .then(this.setConnection)
        .then(this.createDatabase)
        .then(this.createTables)
        .then(this.closeConnection)
    }
  }
}
export = DBUtils;
