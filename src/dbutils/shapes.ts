module DBUtils {
  export interface IndexOptions {
    multi?: boolean;
    geo?: boolean;
  }

  export interface Index {
    name: string;
    options?: IndexOptions;
  }
  export interface TableShape {
    tableName: string;
    indices: Array<Index>;
  }

  export interface DBShape {
    dbname: string;
    tables: Array<TableShape>
  }
}
export = DBUtils;
