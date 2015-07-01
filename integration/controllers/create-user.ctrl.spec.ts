
import Restify = require('restify');
import Promise = require('bluebird');
import CreateUserController = require('../../src/controllers/create-user.ctrl');

function createUser(req:Restify.Request, res:Restify.Response):Promise<void> {
  return new Promise<void>((resolve, reject) => {
    function next() {resolve(null)};
    CreateUserController.createUser(req, res, next);
  });
}

describe('CreateUserController', () => {
  xit('should create a user', (done) => {
    done();
  });
});
