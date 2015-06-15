import r = require('rethinkdb');
import c = require('../../src/config');
import dbutils = require('../../src/dbutils/migrator');

var migrator = new dbutils.Migrator();
var conn : r.Connection;

beforeAll((done) => {
  migrator.migrate(c.Config.db)
    .then(() => {return r.connect(c.Config.db);})
    .then((_conn) => {conn = _conn;})
    .then(done);
});

afterAll((done) => {
  if (conn) {
    conn.close().then(done);
  }
});

describe('Database Migrator', () => {
  var fail = (error) => {expect(error).toBeUndefined();}
  var testTrue = (result) => {expect(result).toBe(true);}
  var dbShape = {
    dbname: 'froyo',
    tables: ['user', 'carpools']
  };

  it('should have database named to following', () => {
    expect(dbutils.Migrator.dbShape.dbname).toBe(dbShape.dbname);
  });

  it('should have created databse ' + dbShape.dbname, (done) => {
    r.dbList().contains(dbShape.dbname).run(conn)
      .then(testTrue)
      .error(fail)
      .finally(done);
  });

  it('should have created following tables: ' + dbShape.tables, (done) => {
    r.db(dbShape.dbname).tableList().contains(dbShape.tables[0]).run(conn)
      .then(testTrue)
      .error(fail)
      .finally(done);
  });


});
