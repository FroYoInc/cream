/**
 *
 *
 */
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
        userInfo.lastName, userInfo.firstName, userInfo.userName,
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
      .catch(errors.UserExistException, errors.EmailExistException, (err) => {
        res.send(409, err)
        next();
      })
      .catch((err) => {
        res.send(500, err)
        next();
      });
  }
}
export = CreateUserController;
