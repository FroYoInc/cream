// Type definitions for express-session
// Project: https://www.npmjs.org/package/express-session
// Definitions by: Hiroki Horiuchi <https://github.com/horiuchi/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../restify/restify.d.ts" />

declare module Restify {

  export interface Request {
    session: Session;
  }

  export interface Session {
    [key: string]: any;

    regenerate: (callback: (err: any) => void) => void;
    destroy: (callback: (err: any) => void) => void;
    reload: (callback: (err: any) => void) => void;
    save: (callback: (err: any) => void) => void;
    touch: (callback: (err: any) => void) => void;

    cookie: SessionCookie;
  }
  export interface SessionCookie {
    originalMaxAge: number;
    path: string;
    maxAge: number;
    secure?: boolean;
    httpOnly: boolean;
    domain?: string;
    expires: Date;
    serialize: (name: string, value: string) => string;
  }
}

declare module "express-session" {
  import restify = require('restify');

  function session(options?: session.SessionOptions): restify.RequestHandler;

  module session {
    export interface SessionOptions {
      secret: string;
      name?: string;
      store?: Store;
      cookie?: any;
      genid?: (req: restify.Request) => string;
      rolling?: boolean;
      resave?: boolean;
      proxy?: boolean;
      saveUninitialized?: boolean;
      unset?: string;
    }

    export interface Store {
      get: (sid: string, callback: (err: any, session: Restify.Session) => void) => void;
      set: (sid: string, session: Restify.Session, callback: (err: any) => void) => void;
      destroy: (sid: string, callback: (err: any) => void) => void;
      length?: (callback: (err: any, length: number) => void) => void;
      clear?: (callback: (err: any) => void) => void;
    }
    export class MemoryStore implements Store {
      get: (sid: string, callback: (err: any, session: Restify.Session) => void) => void;
      set: (sid: string, session: Restify.Session, callback: (err: any) => void) => void;
      destroy: (sid: string, callback: (err: any) => void) => void;
      all: (callback: (err: any, obj: { [sid: string]: Restify.Session; }) => void) => void;
      length: (callback: (err: any, length: number) => void) => void;
      clear: (callback: (err: any) => void) => void;
    }
  }

  export = session;
}

