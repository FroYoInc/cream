/// <reference path="../../typings/rethinkdb/rethinkdb.d.ts"/>

import r = require('rethinkdb');

module DBUtils {

  export interface DatabaseDescription {
    dbname : string,
    tables : [string]
  };

  export class Migrator {
    private _conn : r.Connection;
    private _dbDescription : DatabaseDescription;

    constructor() {
        this._dbDescription = {
          dbname: 'Froyp',
          tables: ['foo']
        };
    }
    
    get dbDescription() : DatabaseDescription {
      return this._dbDescription;
    }

    private setConnection(conn : r.Connection) {
      console.log('Setting connection');
      this._conn = conn;
    }

    private closeConnection() {
      console.log('Closing connection');
      return this._conn.close();
    }

    private createDatabase() {
      console.log('Creating db');
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
