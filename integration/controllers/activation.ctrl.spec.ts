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

   function test0(statusCode) {
     expect(statusCode).toBe(302);
   }

   function test1(header, location) {
     expect(header).toBe('Location');
     expect(location).toBe('/login');
   }

   function test2(header,location) {
     expect(header).toBe('Location');
     expect(location).toBe('/invalid-activation');
   }

   function test3(statusCode){
    expect(statusCode).toBe(200);
   }


  it('should activate a user and redirect request to login page', (done) => {

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

    var req = <restify.Request> {params: {'activate': 'invalidcode'}};
    var res = <restify.Response> {send: test0, header: test2};

    activate(req, res)
      .catch(fail)
      .error(fail)
      .finally(done);
  })

  it('should resend an activation email', (done) => {
    
    var test200 =  (result) => {expect(result).toBe(200)};
    var rs = utils.rs;
    var em = utils.em;
    var email = em();
    var req = <restify.Request> {params: {'email': email}};
    var res = <restify.Response> {send: test0, header: test2};

    userService.createUser(rs(), rs(), rs(), email, rs(), rs())
    .then( (_user) => {
      ActivationCtrl.resendActivationHelper(req)
      .then(test200)
      .catch(fail)
      .finally(done)
    })

  })

})
