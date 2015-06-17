import r = require('rethinkdb');
import c = require('../../src/config');
import Migrator = require('../../src/dbutils/migrator');
import Shapes = require('../../src/dbutils/shapes');

var migrator = new Migrator.Migrator();
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

  var dbShape : Shapes.DBShape = {
    dbname: 'froyo',
    tables: [{
      tableName: 'users',
      indices: ['userName', 'email']
    }]
  };

  it('should have database named to following', () => {
    expect(Migrator.Migrator.dbShape.dbname).toBe(dbShape.dbname);
  });

  it('should have created databse ' + dbShape.dbname, (done) => {
    r.dbList()
      .contains(dbShape.dbname)
      .run(conn)
      .then(testTrue)
      .error(fail)
      .finally(done);
  });

  var tables = dbShape.tables.map((t) => {return t.tableName});
  it('should have created following tables: ' + tables, (done) => {
    r.db(dbShape.dbname)
      .tableList()
      .contains(r.args(tables))
      .run(conn)
      .then(testTrue)
      .error(fail)
      .finally(done);
  });


});
