declare module 'generic-pool' {
  export function Pool(obj: PoolShape): Pool;

  export interface PoolShape {
    name: string;
    create: (err: any, conn: any) => void;
    max: number;
    min: number;
    log: boolean;
  }

  export interface Pool {
    acquire: (a : (err: any, conn: any) => void) => void
  }
}
