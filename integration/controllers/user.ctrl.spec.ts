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
    var email = utils.em();

    // TODO 
    // Inert an activated user
    var user = {

    }
    q.run(r.db("froyo").table("users").insert(user))()
    
    var good = new Restify();
    good.req = new Request();
    good.req.session = new Session();
    good.req.params = new Params();

    var req = good.req;
    req.session["email"] = email;
    
    req.params.curPassword = pw;
    req.params.newPassword = "12345";
    req.params.confirmPassword = "12345";

    var test200 = (result) => {expect(result).toBe(200);}
    var test400 = (result) => {expect(result).toBe(200);}
    var test401 = (result) => {expect(result).toBe(200);}
    var test409 = (result) => {expect(result).toBe(200);}
    var test500 = (result) => {expect(result).toBe(200);}

    xit('should change a password', (done) =>{
        changePassword(req)
        .then(test200)
        changePassword(req)
        .then(test401)
        .catch(fail)
        .finally(done);
    });

    xit('should reset a password', (done) =>{
        resetPassword(good.req)
    });


})