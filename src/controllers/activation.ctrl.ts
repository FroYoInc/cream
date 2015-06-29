/// <reference path="../../typings/express-session/express-session.d.ts" />
import Restify = require('restify');
import auth = require('../services/user-auth');
import userService = require('../services/user-service');
import models = require('../models/models');
import Promise = require('bluebird');

module ActivationController {
  export function activate (req:Restify.Request,res:Restify.Response,next){
    var authenticate = req.params.auth;
    //take out after integration tests have passed 
    var create_user = userService.createUser (
      'firstname', 'lastname',
      'username', 'email@email.com',
      'phash', 'salt')


    userService.activateUser(authenticate)
      .then((user) => {
      console.log(user)
      })
      .catch((err) => {
        console.error(err)
      });
    console.log("req.params.auth:" + req.params.auth);
    res.send(200);
    next();
  }
}

export = ActivationController;
