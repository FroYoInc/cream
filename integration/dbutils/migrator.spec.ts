import dbutils = require('../../src/dbutils/migrator');
var migrator = new dbutils.Migrator();

describe('Database Migrator', () => {
  it('should create Froyo database', () => {
    expect(dbutils.Migrator.dbShape.dbname).toBe('froyo');
  });
});
