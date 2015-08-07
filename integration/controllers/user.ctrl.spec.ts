import utils = require('../utils');
import CreateUserController = require('../../src/controllers/create-user.ctrl');
import userService = require('../../src/services/user-service');
import config = require('../../src/config');
import auth = require("../../src/services/user-auth");
import userCtrl = require('../../src/controllers/users');
import q = require('../../src/dbutils/query');
import r = require('rethinkdb');
import bcrypt = require('bcrypt');

function resetPassword(req){
    return userCtrl.resetPassword(req);
}

function changePassword(req){
    return userCtrl.changePassword(req);
}

class Session {
  [key: string] : any;
}

class Request {
  session: Session;
  params: Params;
}


class Params{
  email: string;
  curPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class Response {
  session: Session;
}

class Restify {
  req: Request;
  res: Response;
}
describe("UserController", () =>{
    
    var pw = "1234";
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(pw, salt);

    var good = new Restify();
    good.req = new Request();
    good.req.session = new Session();
    good.req.params = new Params();

    var req = good.req;
    
    req.params.curPassword = pw;
    req.params.newPassword = "12345";
    req.params.confirmPassword = "12345";

    good.req.params.curPassword = pw;
    good.req.params.newPassword = "12345";
    good.req.params.confirmPassword = "12345";

    var user = {
      firstName: "Bill",
      lastName: "Smith",
      userName: "BSmith",
      email: "bs@froyo.com",
      isAccountActivated: true,
      carpools: [],
      passwordHash: hash,
      salt: salt,
      id: "bsmith4life"
    };
    
    req.session["email"] = user.email;
    good.req.session["email"] = user.email;
    req.session["userID"] = user.id;

    var test200 = (result) => {expect(result).toBe(200);}
    var test400 = (result) => {expect(result).toBe(400);}
    var test401 = (result) => {expect(result).toBe(401);}
    var test409 = (result) => {expect(result).toBe(409);}
    var test500 = (result) => {expect(result).toBe(500);}

    it('should change a password', (done) =>{
      q.run(r.db("froyo").table("users").insert(user))()
      .then( () => {
        changePassword(req)
        .then(test200)
        .then( () => {
          changePassword(req)
          .then(test401)
          .catch(fail)
          .finally(done);
        })
      });

    });

    it('should reset a password', (done) =>{
        req.params.curPassword = req.params.newPassword;
        req.params.email = user.email;
        resetPassword(good.req)
        .then(test200)
        .then( () => {
          changePassword(good.req)
          .then(test401)
          .then( () => {
            req.params.curPassword = req.params.newPassword;
            req.params.confirmPassword = "1234";
            changePassword(good.req)
            .then(test409)
            .catch(fail)
            .finally(done);
          })
        })
        .catch(fail);
    });


})