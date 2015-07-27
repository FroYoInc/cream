/// <reference path="../../typings/express-session/express-session.d.ts" />
import Restify = require('restify');
import auth = require('../services/user-auth');
import userService = require('../services/user-service');
import models = require('../models/models');
import Promise = require('bluebird');
import errors = require('../errors/errors');
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

  export function resendActivation(req:Restify.Request, res:Restify.Response, next){
      var validReq = pv.verifyParams(req.params.email);
      if(validReq){
          userService.resendActivationEmail(req.params.email)
          .then((result) => {
              if(result){
                  res.send(200);
              }
          })
          .catch(errors.UserAlreadyActivatedException, (err) => {
              res.send(409);
          })
          .catch(errors.UserDataNotFound, (err) => {
              res.send(404);
          })
      }
      else{
          res.send(400);
      }
  }
}

export = ActivationController;
