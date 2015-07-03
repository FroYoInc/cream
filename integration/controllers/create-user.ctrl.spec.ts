
import Restify = require('restify');
import Promise = require('bluebird');
import utils = require('../utils');
import CreateUserController = require('../../src/controllers/create-user.ctrl');

function createUser(req:Restify.Request, res:Restify.Response):Promise<void> {
  return new Promise<void>((resolve, reject) => {
    function next() {resolve(null)};
    CreateUserController.createUser(req, res, next);
  });
}

describe('CreateUserController', () => {
  xit('should create a user', (done) => {

    var userName = utils.rs();
    var email = utils.em();

    var inputJSON = {
      'firstName': 'John',
      'lastName': 'Doe',
      'userName': userName,
      'email': email,
      'password': 'somePassword'
    }

    var outputJSON = {
      'firstName': 'John',
      'lastName': 'Doe',
      'userName': userName,
      'email': email
    }

    function test(status, json) {
      expect(status).toBe(201);
      expect(json).toBe(outputJSON);
    }

    // var req = <Restify.Request> {body: inputJSON, query: 'asd'};
    var res = <Restify.Response> {json: test};
    done();
  });
});
