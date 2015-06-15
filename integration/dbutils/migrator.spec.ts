import r = require('rethinkdb');
import c = require('../../src/config');
import dbutils = require('../../src/dbutils/migrator');

var migrator = new dbutils.Migrator();
var conn : r.Connection;

beforeAll((cb) => {
  migrator.migrate(c.Config.db)
    .then(() => {return r.connect(c.Config.db);})
    .then((_conn) => {conn = _conn;})
    .then(cb);
});

afterAll((cb) => {
  if (conn) {
    conn.close().then(cb);
  }
});

describe('Database Migrator', () => {
  var dbShape = {
    dbname: 'froyo'
  };

  it('should have database named to following', () => {
    expect(dbutils.Migrator.dbShape.dbname).toBe(dbShape.dbname);
  });

  it('should have created databse ' + dbShape.dbname, () => {
    r
  });
});
