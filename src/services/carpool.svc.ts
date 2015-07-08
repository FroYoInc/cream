
import Promise = require('bluebird');
import r = require('rethinkdb');
import uuid = require('uuid');
import assert = require('assert');
import q = require('../dbutils/query');
import models = require('../models/models');
import errors = require('../errors/errors');

var db = 'froyo';
var table = 'carpools';
var carpoolNameIndex = 'name';

module CarpoolService {
  export function createCarpool(name: string,
    campus: models.Campus, description: string):Promise<models.Carpool> {
    return new Promise<models.Carpool>((resolve, reject) => {
      reject(new Error("Method not implemented"));
    })
  }

  export function doesCarpoolExist(carpoolName: string): Promise<boolean> {
    var carpoolExistQuery = r.db(db)
      .table(table)
      .getAll(carpoolName, {index: carpoolNameIndex})
      .isEmpty().not();

    return q.run(carpoolExistQuery)()
      .then((result) => {
        return result === true
      });
  }
}

export = CarpoolService;
