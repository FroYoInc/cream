/// <reference path="../../typings/express-session/express-session.d.ts" />
import Restify = require('restify');
import auth = require('../services/user-auth');
import userService = require('../services/user-service');
import models = require('../models/models');
import Promise = require('bluebird');

module ActivationController {
  export function activate (req:Restify.Request,res:Restify.Response,next){
    var activate = req.params.activate;

     userService.activateUser(activate)
      .then((user) => {
        //Activation was successfull. Refirect request to
        res.header('Location', '/login');
        res.send(302);

      })
      .catch((err) => {
       //Activation was unsuccessful. Redirect request
        res.header ('Location', '/invalid-activation');
        res.send(302);

      });
    next();
  }
}

export = ActivationController;
