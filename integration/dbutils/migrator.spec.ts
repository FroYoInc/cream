import r = require('rethinkdb');
import Promise = require('bluebird');
import c = require('../../src/config');
import Migrator = require('../../src/dbutils/migrator');
import Shapes = require('../../src/dbutils/shapes');

var migrator = new Migrator.Migrator();
var conn : r.Connection;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

var dbShape : Shapes.DBShape = {
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
    indices: ['name', 'pickupLocation.geoCode', 'geoPoint']
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

beforeAll((done) => {
  function migrate() {
    return () => {
      return migrator.migrate(c.Config.db);
    }
  }

  function dropTableIfExist() {
    var dbExistQ = r.dbList()
      .contains(dbShape.dbname);
    var dbDropQ = r.dbDrop(dbShape.dbname);
    return () => {
      return r.branch(dbExistQ, dbDropQ, r.now())
        .run(conn);
    }
  }

  r.connect(c.Config.db)
    .then((_conn) => {conn = _conn})
    .then(dropTableIfExist())
    .then(migrate())
    .then(done);
});

afterAll((done) => {
  if (conn) {
    conn.close().then(done);
  } else {
    throw new Error("No rethinkdb exist to close...");
  }
});

describe('Database Migrator', () => {
  var fail = (error) => {expect(error).toBeUndefined();};
  var testTrue = (result) => {expect(result).toBe(true);};

  it('should have the same database shape as described in this test', () => {
    expect(dbShape).toEqual(Migrator.Migrator.dbShape);
  });

  it('should have created database ' + dbShape.dbname, (done) => {
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
  var indices = dbShape.tables
  .filter((t) => {
    return t.indices.length !== 0;
  })
  .map((t) => {
    return t.indices.map((i) => {
      var obj = {};
      obj[t.tableName] = i;
      return obj;
    })
  })
  .reduce((last, next) => {
    return last.concat(next);
  });

  it('should have created following indices: ' + JSON.stringify(indices), (done) => {
    function checkIndices(i: Shapes.TableShape) {
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
    var checks = dbShape.tables
    .filter((t) => {
      return t.indices.length !== 0;
    })
    .map(checkIndices);
    Promise.all(checks)
      .catch(fail)
      .error(fail)
      .finally(done);
  });
});
