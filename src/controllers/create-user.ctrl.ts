import restify = require('restify')
import userService = require('../services/user-service')
import utils = require('../utils/utils');
import models = require('../models/models');
import errors = require('../errors/errors');

module CreateUserController {
  export interface OutputJSON {
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    href: string;
  }
  export function toOutputJSON(user:models.User): OutputJSON {
    return {
      'userName': user.userName,
      'firstName': user.firstName,
      'lastName': user.lastName,
      'email': user.email,
      'href': '/users/' + user.id
    };
  }
  export function createUser(
    req:restify.Request, res:restify.Response, next:restify.Next) {
    var userInfo = req.body;

    var salt: string;
    function generateAndSetSalt() {
      return utils.genSalt()
        .then((_salt) => {
          salt = _salt;
        });
    }
    function getPasswordHash() {
      return utils.hash(userInfo.password, salt);
    }

    function createUser(passwordHash) {
      return userService.createUser(
        userInfo.firstName, userInfo.lastName, userInfo.userName,
        userInfo.email, passwordHash, salt);
    }

    generateAndSetSalt()
      .then(getPasswordHash)
      .then(createUser)
      .then((_user) => {
        res.send(201, toOutputJSON(_user));
        next();
      })
      .catch(
        errors.EmailValidationException,
        errors.UserNameValidationException,
        (err) => {
          next(new restify.BadRequestError(err.message));
      })
      .catch(errors.UserExistException, errors.EmailExistException, (err) => {
        next(new restify.ConflictError(err.message))
      })
      .catch((err) => {
        next(new restify.InternalServerError(err.message))
      });
  }
}
export = CreateUserController;
