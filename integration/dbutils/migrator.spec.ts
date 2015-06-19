import r = require('rethinkdb');
import c = require('../../src/config');
import Migrator = require('../../src/dbutils/migrator');
import Shapes = require('../../src/dbutils/shapes');

var migrator = new Migrator.Migrator();
var conn : r.Connection;

var dbShape : Shapes.DBShape = {
  dbname: 'froyo',
  tables: [{
    tableName: 'users',
    indices: ['userName', 'email']
  }]
};

beforeAll((done) => {
  migrator.migrate(c.Config.db)
    .then(() => {return r.connect(c.Config.db);})
    .then((_conn) => {conn = _conn;})
    .then(done);
});

afterAll((done) => {
  if (conn) {
    return conn.close()
      .then(done)
      .error(done);
    // r.dbDrop(dbShape.dbname)
    //   .run(conn)
    //   .then(() => {return conn.close();})
    //   .then(done);
  } else {
    done(new Error("No rethinkdb exist to close..."))
  }
});

describe('Database Migrator', () => {
  var fail = (error) => {expect(error).toBeUndefined();}
  var testTrue = (result) => {expect(result).toBe(true);}


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
