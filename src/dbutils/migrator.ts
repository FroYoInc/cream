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
      },
      {
        tableName: 'userData',
        indices: []
      }]
    };
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

    private createTables() {
      var createTable = (t) => {
        var test = r.db(Migrator.dbShape.dbname).tableList()
          .contains(t.tableName);
        var trueBranch = r.now();
        var falseBranch = r.db(Migrator.dbShape.dbname)
          .tableCreate(t.tableName);
        return r.branch(test, trueBranch, falseBranch).run(this._conn);
      };
      return p.map(Migrator.dbShape.tables, createTable);
    }

    private createIndices() {
      var _foo = (i: string, tableName: string) => {
        var test = r.db(Migrator.dbShape.dbname).table(tableName).indexList().contains(i);
        var trueBranch = r.now();
        var falseBranch = r.db(Migrator.dbShape.dbname).table(tableName).indexCreate(i);
        return r.branch(test, trueBranch, falseBranch).run(this._conn);
      };
      var createIndex = (table: shapes.TableShape) => {

        table.indices.forEach(function(index) {
          _foo(index, table.tableName);
        });
      };
      return p.map(Migrator.dbShape.tables, createIndex);
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
        .then(this.createIndices)
        .then(this.closeConnection)
    }
  }
}
export = DBUtils;
