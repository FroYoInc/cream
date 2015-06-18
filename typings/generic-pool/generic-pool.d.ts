declare module 'generic-pool' {
  export function Pool(obj: PoolShape): Pool;

  export interface PoolShape {
    name: string;
    create: (err: any, conn: any) => void;
    destroy: (c: any) => void;
    max: number;
    min: number;
    log: boolean;
  }

  export interface Pool {
    acquire: (a : (err: any, conn: any) => void) => void;
    release: (v: any) => void;
  }
}
