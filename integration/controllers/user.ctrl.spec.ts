
import Promise = require('bluebird');
import utils = require('../utils');
import userService = require('../../src/services/user-service');
import users = require('../../src/controllers/users');

class Session {
  [key: string] : any;
}

class Request {
  session: Session;
}


class Response {
  session: Session;
  send: any;
}

class Restify {
  req: Request;
  res: Response;
}

var good = new Restify();
good.res = new Response();
good.req = new Request();
good.req.session = new Session();

good.req.session['userID'] = 'thisisadminid';

function checkAdmin (request, response, next) {
  return users.checkAdmin(request, response, next);
}

describe('User Controller', () => {
  it('should check if user is admin', (done) => {
     good.res.send = (status, message?) => {
       expect(status).toBe(200);
       done();
     }
     checkAdmin(good.req, good.res, done)

    })

  it('should check if user not admin', (done) => {
    good.res.send = (status, message?) => {
      expect(status).toBe(403);
      done();
    }
    userService.createUser(utils.rs(), utils.rs(), utils.rs(), utils.em(), utils.rs(), utils.rs())
    .then( (user) => {
      good.req.session['userID'] = user.id;
      checkAdmin(good.req, good.res, done);
      })

  })

}

)
