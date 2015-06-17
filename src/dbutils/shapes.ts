module DBUtils {
  export interface TableShape {
    tableName: string;
    indices: Array<string>;
  }

  export interface DBShape {
    dbname: string;
    tables: Array<TableShape>
  }
}
export = DBUtils;
