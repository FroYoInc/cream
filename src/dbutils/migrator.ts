/// <reference path="../../typings/rethinkdb/rethinkdb.d.ts"/>
/// <reference path="../../typings/bluebird/bluebird.d.ts"/>

import r = require('rethinkdb');
import p = require('bluebird');
import shapes = require('./shapes');
import bcrypt = require("bcrypt");
import utils = require("../utils/utils");
import q = require('../dbutils/query');

module DBUtils {
  export class Migrator {
    private database ="froyo";
    static dbShape : shapes.DBShape = {
      dbname: 'froyo',
      tables: [{
        tableName: 'users',
        indices: ['userName', 'email']
      },
      {
        tableName: 'userData',
        indices: []
      },
      {
        tableName: 'carpools',
        indices: ['name', 'pickupLocation.geoCode']
      },
      {
        tableName: 'campuses',
        indices: ['name']
      },
      {
        tableName: 'activation',
        indices: []
      },
      {
        tableName : "requests",
        indices: ["carpoolID"]
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
      var forEachTable = (table: shapes.TableShape) => {
        var createIndex = (i: string) => {
          var test = r.db(Migrator.dbShape.dbname).table(table.tableName).indexList().contains(i);
          var trueBranch = r.now();
          var falseBranch = r.db(Migrator.dbShape.dbname).table(table.tableName).indexCreate(i);
          return r.branch(test, trueBranch, falseBranch).run(this._conn);
        };
        return p.map(table.indices, createIndex);
      };
      return p.map(Migrator.dbShape.tables, forEachTable);
    }

    private createAdminAccount() {
      var password = "welovefroyo";
      var salt:string;
      var user;

      function generateAndSetSalt() {
        return utils.genSalt()
          .then((_salt) => {
            salt = _salt;
          });
      }

      function getPasswordHash() {
        return utils.hash(password, salt);
      }

      generateAndSetSalt()
        .then(getPasswordHash)
        .then((hash) => {
          user = {
            firstName: 'Ad',
            lastName: 'Min',
            userName: 'admin',
            email: 'admin@froyo.com',
            isAccountActivated: true,
            id: 'thisisadminid',
            isAdmin: true,
            salt: salt,
            passwordHash: hash
          };
          q.run(r.db(this.database).table("users").insert(user, {conflict:"replace"}))();
        })


    }

    migrate (connOpts : r.ConnectionOptions)  {
      return r.connect(connOpts)
        .then(this.setConnection)
        .then(this.createDatabase)
        .then(this.createTables)
        .then(this.createIndices)
        .then(this.closeConnection)
        .then(()=> {
          this.createAdminAccount();
        })
    }
  }
}
export = DBUtils;
