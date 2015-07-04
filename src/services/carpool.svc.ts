
import Promise = require('bluebird');
import r = require('rethinkdb');
import uuid = require('uuid');
import assert = require('assert');
import q = require('../dbutils/query');
import models = require('../models/models');
import errors = require('../errors/errors');

module CarpoolService {
  export function createCarpool(name: string,
    campus: models.Campus, description: string):Promise<models.Carpool> {
    return new Promise<models.Carpool>((resolve, reject) => {
      reject(new Error("Method not implemented"));
    })
  }
}

export = CarpoolService;
