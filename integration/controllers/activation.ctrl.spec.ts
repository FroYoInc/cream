import restify = require('restify');
import ac = require('../../src/controllers/activation.ctrl');

describe('Activation controller', () => {
  xit('should activate a user given valid activation code', (done) => {
    // var req = {
    //   params: {'activate': 'invalidactivationcode'}
    // };
    // var res = {
    //
    // };
    // ac.activate(req<restify.Response>, res<restify.Response>, ()=> {
    //
    // });
    // done();
  });

  xit('should redirect to login page given valid activation code', (done) => {
    done();
  });

  xit('should redirect to an error page given invalid activation code', (done) => {
    done();
  })
})
