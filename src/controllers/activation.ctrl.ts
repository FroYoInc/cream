/// <reference path="../../typings/express-session/express-session.d.ts" />
import Restify = require('restify');
import auth = require('../services/user-auth');
import userService = require('../services/user-service');
import models = require('../models/models');
import Promise = require('bluebird');
import errors = require('../errors/errors');
import pv = require('../validation/parameter-validator');

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

  export function resendActivationHelper(req:Restify.Request) : Promise<any>{
    return new Promise<any>((resolve, reject) => {
      var validReq = pv.verifyParams(req.params.email);
      if(validReq){
          userService.resendActivationEmail(req.params.email)
          .then((result) => {
              if(result){
                  resolve(200);
              }
          })
          .catch(errors.UserAlreadyActivatedException, (err) => {
              resolve(409);
          })
          .catch(errors.ActivationDataNotFoundException, (err) => {
              resolve(404);
          })
          .catch(errors.UserNotFoundException, (err) => {
              resolve(404);
          })
          .catch(errors.EmailValidationException, (err) => {
            resolve(404);
          })
          .catch(errors.ActivationSendLockException, (err) => {
            resolve(423);
          })
          .catch(Error, (err) => {
            resolve(500);
          })
      }
      else{
          resolve(400);
      }
    });

  }

  export function resendActivation(req:Restify.Request,res:Restify.Response,next){
      resendActivationHelper(req)
      .then((statusCode) => {
        res.send(statusCode);
      })
  }
}

export = ActivationController;
