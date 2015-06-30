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

function activate(req: restify.Request, res: restify.Response):Promise<void> {
  return new Promise<void>((resolve, reject) => {
    function next() {resolve(null);}
    ActivationCtrl.activate(req, res, next)
  });
}

describe('Activation controller', () => {
  it('should activate a user given valid activation code', (done) => {

    function test(arg) {
      console.log(arg)
      expect(arg).toBe(200);
    }

    var req = <restify.Request> {params: {'activate': ''}};
    var res = <restify.Response> {send: test};

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

  xit('should redirect to login page given valid activation code', (done) => {
    done();
  });

  xit('should redirect to an error page given invalid activation code', (done) => {
    done();
  })
})
