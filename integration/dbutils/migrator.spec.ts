import r = require('rethinkdb');
import Promise = require('bluebird');
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
    r.dbDrop(dbShape.dbname)
      .run(conn)
      .then(() => {return conn.close();})
      .then(done);
  } else {
    throw new Error("No rethinkdb exist to close...");
    done();
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
      .catch(fail)
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
      .catch(fail)
      .finally(done);
  });
  // Get list of form [{'tableName': 'indexName'}, {'tableName': 'indexName'}, ...]
  var indices = dbShape.tables.map((t) => {
    return t.indices.map((i) => {
      var obj = {};
      obj[t.tableName] = i
      return obj;
    })
  }).reduce((last, next) => {
    return last.concat(next);
  });

  it('should have created following indices: ' + JSON.stringify(indices), (done) => {
    function foo(i: Shapes.TableShape) {
      return r.db(dbShape.dbname)
        .table(i.tableName)
        .indexList()
        .contains(r.args(i.indices))
        .run<Boolean>(conn)
        .then((result) => {
          if (result === false) {
            var msg = "Table " + i.tableName + ' missing indices in ' +
            JSON.stringify(i.indices);
            throw new Error(msg);
          } else {
            return result;
          }
        })
    }
    var checks = dbShape.tables.map(foo);
    Promise.all(checks)
      .catch(fail)
      .error(fail)
      .finally(done);
  })
});
