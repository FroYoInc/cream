import restify = require('restify');
import Promise = require('bluebird');
import utils = require('../utils');
import ActivationCtrl = require('../../src/controllers/activation.ctrl');
import userService = require('../../src/services/user-service');


function fail(error) {expect(error).toBeUndefined();}
function testTrue(result) {expect(result).toBe(true);}
function testFalse(result) {expect(result).toBe(false);}

function getValidActivationCode():Promise<string> {
  return userService.createUser(
    'John', 'Doe', utils.rs(), utils.em(), '_', '_')
    .then(utils.findUserActivationCode)
}

// A wrapper around ActivationCtrl.activate(). This returns a Promise
// and it is only fufilled when, ActivationCtrl.activate() method calls
// its next() function
function activate(req: restify.Request, res: restify.Response):Promise<void> {
  return new Promise<void>((resolve, reject) => {
    function next() {resolve(null);}
    ActivationCtrl.activate(req, res, next)
  });
}

describe('Activation controller', () => {
  it('should activate a user and redirect request to login page', (done) => {

    function test0(statusCode) {
      expect(statusCode).toBe(302);
    }

    function test1(header, location) {
      expect(header).toBe('Location');
      expect(location).toBe('/login');
    }

    var req = <restify.Request> {params: {'activate': ''}};
    var res = <restify.Response> {send: test0, header: test1};

    getValidActivationCode()
      .then((activationCode) => {
        req.params.activate = activationCode;
      })
      .then(() => {
        return activate(req, res);
      })
      .catch(fail)
      .error(fail)
      .finally(done)
  });

  it('should redirect to an error page given invalid activation code', (done) => {

    function test0(statusCode) {
      expect(statusCode).toBe(302);
    }

    function test1(header, location) {
      expect(header).toBe('Location');
      expect(location).toBe('/invalid-activation');
    }

    var req = <restify.Request> {params: {'activate': 'invalidcode'}};
    var res = <restify.Response> {send: test0, header: test1};

    activate(req, res)
      .catch(fail)
      .error(fail)
      .finally(done);
  })
})
