import restify = require("restify")
import userService = require('../services/user-service')

module CreateUserController {
  export function createUser(req:restify.Request, res:restify.Response, next:restify.Next) {

    var userInfo = req.body;
      console.log(userInfo);
      //hash password
      //create salt

    userService.createUser(userInfo.lastName, userInfo.firstName, userInfo.userName, userInfo.email, userInfo.passwordHash, userInfo.salt)
        .then((_user) => {
          res.send(_user);
        }).catch(console.error);

    //createUser('_', '_', 'orio1', 'c@example.com', '_', '_')()
    //    .then((_user) => {
    //      user = _user;
    //      return _user.id;
    //    })

    //res.json();
    //  console.log(req.body);
//  var userInfo = req.body;
//
//  //createUser.then()...
//  //userService.createUser(userInfo.lastName, userInfo.firstName, userInfo.userName, userInfo.email, userInfo.passwordHash, userInfo.salt).then(res.end());
//  //userService.createUser('Smith','Bill', 'EpicRidezFTW', 'bsmith@email.com', 'password', 'salt').then(res.end());
//
//  res.end();

    //console.log("TODO");


    next();
  }
}
export = CreateUserController;
