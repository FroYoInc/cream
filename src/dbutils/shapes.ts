module DBUtils {
  export interface TableShape {
    tableName: string;
    indices: [string];
  }

  export interface DBShape {
    dbname: string;
    tables: [TableShape]
  }
}
export = DBUtils;
