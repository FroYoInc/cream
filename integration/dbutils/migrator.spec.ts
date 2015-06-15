import dbutils = require('../../src/dbutils/migrator');
var migrator = new dbutils.Migrator();

beforeAll((fn) => {
});

describe('Database Migrator', () => {
  it('should have database named to following', () => {
    expect(dbutils.Migrator.dbShape.dbname).toBe('froyo');
  });
});
