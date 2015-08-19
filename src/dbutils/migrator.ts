/// <reference path="../../typings/rethinkdb/rethinkdb.d.ts"/>
/// <reference path="../../typings/bluebird/bluebird.d.ts"/>

import r = require('rethinkdb');
import p = require('bluebird');
import shapes = require('./shapes');
import bcrypt = require("bcrypt");
import utils = require("../utils/utils");
import q = require('../dbutils/query');
import c = require('../config');

module DBUtils {
  export class Migrator {
    static dbShape : shapes.DBShape = {
      dbname: 'froyo',
      tables: [{
        tableName: 'users',
        indices: [{name: 'userName'}, {name:'email'}]
      },
      {
        tableName: 'userData',
        indices: []
      },
      {
        tableName: 'carpools',
        indices: [{name:'name'}, {name: 'pickupLocation.geoCode'}, {name: 'geoPoint', options: {geo: true}}]
      },
      {
        tableName: 'campuses',
        indices: [{name:'name'}]
      },
      {
        tableName: 'activation',
        indices: []
      },
      {
        tableName : "requests",
        indices: [{name: "carpoolID"}]
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
        var createIndex = (i: shapes.Index) => {
          var test = r.db(Migrator.dbShape.dbname).table(table.tableName).indexList().contains(i.name);
          var trueBranch = r.now();
          console.log(i.name, i.options);
          var falseBranch = r.db(Migrator.dbShape.dbname).table(table.tableName).indexCreate(i.name, i.options);
          return r.branch(test, trueBranch, falseBranch).run(this._conn)
            .delay(1000)
            .then(() => {
              return r.db(Migrator.dbShape.dbname).table(table.tableName).indexWait(i.name).run(this._conn)
            });
        };
        return p.map(table.indices, createIndex);
      };
      return p.map(Migrator.dbShape.tables, forEachTable);
    }

    private createAdminAccount() {
      var salt:string;
      var user;

      function generateAndSetSalt() {
        return utils.genSalt()
          .then((_salt) => {
            salt = _salt;
          });
      }

      function getPasswordHash() {
        return utils.hash(c.Config.admin.password, salt);
      }

      return generateAndSetSalt()
        .then(getPasswordHash)
        .then((hash) => {
          user = {
            firstName: c.Config.admin.firstName,
            lastName: c.Config.admin.lastName,
            userName: c.Config.admin.userName,
            email: c.Config.admin.email,
            isAccountActivated: true,
            isAdmin: true,
            salt: salt,
            passwordHash: hash
          };
          return q.run(r.db(Migrator.dbShape.dbname).table("users").insert(user, {conflict:"replace"}))();
        })


    }

    migrate (connOpts : r.ConnectionOptions)  {
      return r.connect(connOpts)
        .then(this.setConnection)
        .then(this.createDatabase)
        .then(this.createTables)
        .then(this.createIndices)
        .then(this.createAdminAccount)
        .then(this.closeConnection)
    }
  }
}
export = DBUtils;
