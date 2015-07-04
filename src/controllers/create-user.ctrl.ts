import restify = require('restify')
import userService = require('../services/user-service')
import utils = require('../utils/utils');
import errors = require('../errors/errors');

module CreateUserController {
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
        res.send(201, {
          'userName': _user.userName,
          'firstName': _user.firstName,
          'lastName': _user.lastName,
          'email': _user.email,
          'href': '/users/' + _user.id
        });
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
