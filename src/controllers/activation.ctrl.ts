/// <reference path="../../typings/express-session/express-session.d.ts" />
import Restify = require('restify');
import auth = require('../services/user-auth');
import userService = require('../services/user-service');
import models = require('../models/models');
import Promise = require('bluebird');

module ActivationController {
  export function activate (req:Restify.Request,res:Restify.Response,next){
    var activate = req.params.activate;
    //take out after integration tests have passed
    var create_user = userService.createUser (
      'bob', 'lino',
      'username5', 'email5@email3@com',
      'phash', 'salt')


    userService.activateUser(activate)
      .then((user) => {
      console.log(user)
      })
      .catch((err) => {
        console.error(err)
      });
    console.log("req.params.activate:" + req.params.activate);
    res.send(200);
    next();
  }
}

export = ActivationController;
