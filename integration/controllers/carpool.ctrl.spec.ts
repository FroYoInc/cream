import restify = require('restify');
import Promise = require('bluebird');
import utils = require('../utils');
import userService = require('../../src/services/user-service');
import CarpoolSvc = require('../../src/services/carpool.svc');
import CarpoolCtrl = require('../../src/controllers/carpool.ctrl');


function fail(error) {expect(error).toBeUndefined();}
function testTrue(result) {expect(result).toBe(true);}
function testFalse(result) {expect(result).toBe(false);}

describe('Carpool controller', () => {

  xit('should create a carpool', (done) => {
    done();
    /*var req = <restify.Request> {params: {'activate': ''}};
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
      .finally(done)*/
  });
})
