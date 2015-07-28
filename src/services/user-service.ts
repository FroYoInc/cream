import Promise = require('bluebird');
import r = require('rethinkdb');
import uuid = require('uuid');
import EmailService = require('./email-service');
import nodemailer = require('nodemailer');
import EmailValidator = require('../validation/email.validator');
import UserNameValidator = require('../validation/username.validator');
import q = require('../dbutils/query');
import models = require('../models/models');
import errors = require('../errors/errors');
import config = require('../config');
import assert = require('assert');


module UserService {


  var db = 'froyo';
  var table = 'users';
  var activationTable = 'activation';
  var userDataTable = 'userData';
  var userNameIndex = 'userName';
  var emailIndex = 'email';
  var transportConfig : nodemailer.TransporterConfig = null;
  var domainWhiteList = config.Config.validator.domainWhitelist;
  var emailValidator = new EmailValidator.EmailValidator(domainWhiteList);
  var userNameValidator = new UserNameValidator.UserNameValidator();

  export function setEmailTransportConfig(
    config: nodemailer.TransporterConfig) {
  	transportConfig = config;
  }

  function userCreateQuery (user) {
    return r.db(db)
      .table(table)
      .insert(user);
  }

  export function userExistQuery(userName) {
    return r.db(db)
      .table(table)
      .getAll(userName, {index: userNameIndex})
      .isEmpty().not();
  }

  function emailExistQuery(email) {
    return r.db(db)
      .table(table)
      .getAll(email, {index: emailIndex})
      .isEmpty().not();
  }

  export function doesUserExist(userName: string):Promise<boolean> {
    return q.run(userExistQuery(userName), 'doesUserExist')()
      .then((result) => {
        return result === true
      });
  }

  export function createUser(
    firstName:string, lastName:string,
    userName:string, email:string,
    passwordHash: string, salt: string):Promise<models.User> {

     var user: models.User = {
       firstName: firstName,
       lastName: lastName,
       userName: userName,
       email: email,
       isAccountActivated: false,
       carpools: [],
       passwordHash: passwordHash,
       salt: salt
     }

    var doesUserOrEmailExistQuery = userExistQuery(userName)
      .or(emailExistQuery(email));

    var returnError = r.branch(
      userExistQuery(userName), r.expr('user exist'), r.expr('email exist'));
    var createUserIfUserOrEmailDoesNotExistQuery =
      r.branch(doesUserOrEmailExistQuery, returnError, userCreateQuery(user));

    function throwErrorIfUserExistOrEmailExist(result)  {
      if (result === 'user exist') {
        throw new errors.UserExistException();
      } else if (result === 'email exist') {
        throw new errors.EmailExistException();
      } else {
        return result;
      }
    }

    var createUserIfUserOrEmailDoesNotExist =
      q.run(createUserIfUserOrEmailDoesNotExistQuery, 'createUser');

    function setUserID(result) {
      assert.equal(result.generated_keys.length, 1,
        "expected only 1 object to be created");
      user.id = result.generated_keys[0];
      return user;
    }

    function generateAndSaveActivationCode(user: models.User) {
      var activationCode = uuid.v4();
      var activation: models.Activation = {
        id: activationCode,
        userId: user.id
      }


      function sendActivation() {
      	var emailService = new EmailService.EmailService();

      	if (transportConfig != null) {
      	  emailService.transportConfig = transportConfig;
      	}
    	  return emailService.sendActivation(user, activationCode);
      }

      var saveActivationQuery = r.db(db)
        .table(activationTable)
        .insert(activation);

      return q.run(saveActivationQuery,
        'saveActivation')().then(sendActivation).return(user);
    }

    function isValidUserName() {
      return userNameValidator.isValid(userName);
    }

    return emailValidator.isValid(email)
      .then(isValidUserName)
      .then(createUserIfUserOrEmailDoesNotExist)
      .then(throwErrorIfUserExistOrEmailExist)
      .then(setUserID)
      .then(generateAndSaveActivationCode);
  }

  export function getUserById(id: string):Promise<models.User> {
    var getUserByIdQuery = r.db(db)
      .table(table)
      .get(id);

    function throwErrorIfUserNotFound(_user) {
      if (_user === null) {
        throw new errors.UserNotFoundException()
      } else {
        return _user;
      }
    }

    function returnUser(_user):models.User {
      return <models.User> _user;
    }

    return q.run(getUserByIdQuery, 'getUserById')()
      .then(throwErrorIfUserNotFound)
      .then(returnUser)
  }

  function returnUser(result)  {
    assert.equal((result.length <= 1), true,
    "Expected only 0 or 1 user to return." +
    " More than 1 user exist with same email or userName")
    if (result.length === 0) {
      throw new errors.UserNotFoundException();
    }
    var user:models.User = result[0]
    return user;
  }

  export function getUserByEmail(email: string):Promise<models.User> {
    var getUserByEmailQuery = r.db(db)
      .table(table)
      .getAll(email, {index: emailIndex})
      .coerceTo('array');
    return emailValidator.isValid(email)
      .then(q.run(getUserByEmailQuery, 'getUserByEmail'))
      .then(returnUser);
  }

  export function getUserByUserName(userName: string):Promise<models.User> {
    var getUserByUserNameQuery = r.db(db)
      .table(table)
      .getAll(userName, {index: userNameIndex})
      .coerceTo('array');
    return q.run(getUserByUserNameQuery, 'getUserByUserName')()
      .then(returnUser)
  }

  function updateUser(user:models.User):Promise<models.User> {
    assert.equal((user.id !== null), true,
      "Trying to update a user that doesn't have an id");
    var updateUserQuery = r.db(db)
      .table(table)
      .get(user.id)
      .update(user, {durability: 'hard'});
    return q.run(updateUserQuery, 'updateUser')().then(() => {return user});
  }

  export function activateUser(activationCode: string):Promise<models.User> {

    if (activationCode === '') {
      throw new errors.InvalidActivationCodeException();
    }

   function getUserIdByActivationCode() {
      var getActivationQuery = r.db(db)
        .table(activationTable)
        .get(activationCode);
      return q.run(getActivationQuery, 'getUserIdByActivationCode')()
        .then((_result) => {
          var activation:models.Activation = _result;
          if (_result === null) {
            throw new errors.InvalidActivationCodeException()
          }
          return activation.userId
        });
    }

   function setUserToActivated(user:models.User):models.User {
      if (user.isAccountActivated) {
        throw new errors.UserAlreadyActivatedException()
      }
      user.isAccountActivated = true;
      return user;
    }

    return getUserIdByActivationCode()
      .then(getUserById)
      .then(setUserToActivated)
      .then(updateUser);
  }

  export function getUserData(userID: string) : Promise<models.UserData> {
    var getUserDataQuery = r.db(db)
      .table(userDataTable)
      .get(userID);
    return q.run(getUserDataQuery, 'getUserData')()
      .then((_result) => {
        var userData:models.UserData = _result;

        if(_result === null){
          throw new errors.UserDataNotFound();
        }

        return userData;
      });
  }

  export function updateUserData(userData:models.UserData):
  Promise<models.UserData> {
    assert.equal((userData.id !== null), true,
      "Trying to update a userData without an id");
    var updateUserDataQuery = r.db(db)
      .table(userDataTable)
      .get(userData.id)
      .update(userData, {durability: 'hard'});
    return q.run(updateUserDataQuery, 'updateUserData')()
      .then(() => {return userData});
  }

  export function createUserData(userData:models.UserData):
  Promise<models.UserData> {
    var insertUserData = r.db(db).table(userDataTable).insert(userData);
    return q.run(insertUserData, 'createUserData')()
      .then(() => {return userData});
  }

  export function resendActivationEmail(email:string) : Promise<boolean>{
      return new Promise<boolean> ((resolve, reject) => {
        getUserByEmail(email)
        .then((_user) => {
            if(!_user.isAccountActivated){
              getUserData(_user.id)
              .then( (userData) => {
                sendIfNotLocked(userData, _user, resolve, reject);
              })
              .catch(errors.UserDataNotFound, (err) => {
                var userData = {
                  activationLockout:0,
                  id: _user.id,
                  numLoginAttempts: 0,
                  lockoutExpiration: 0,
                };
                sendIfNotLocked(userData, _user, resolve, reject)
              })
            }
            else{
              throw new errors.UserAlreadyActivatedException();
            }
          })
          .catch(errors.UserNotFoundException, (err) => {
            reject(err);
          })
          .catch(errors.EmailValidationException, (err) => {
            reject(err);
          })

    });

    function sendIfNotLocked(userData, user, resolve, reject){
      var now = (new Date()).getTime(); // Get the epoch time
      if(userData.activationLockout == undefined || userData.activationLockout <= now ){
        var getActivationQuery = r.db(db)
          .table(activationTable)
          .filter({userId: user.id})
          .coerceTo("array")
          .limit(1);

        q.run(getActivationQuery)()
        .then( (activation) => {
          if(activation[0] != undefined){
            userData.activationLockout = now + config.Config.activationLock;
            updateUserData(userData)
            .then( (userData) => {
              sendActivation(user, activation[0].id);
              resolve(true);
            })
            .catch(Error, (err) => {
              reject(err);
            })
          }
          else{
            throw new errors.ActivationDataNotFoundException();
          }
        });
      }
      else{
        throw new errors.ActivationSendLockException();
      }
    }

    function sendActivation(user, activationCode) {
      var emailService = new EmailService.EmailService();

      if (transportConfig != null) {
        emailService.transportConfig = transportConfig;
      }
      return emailService.sendActivation(user, activationCode);
    }

  }

}

export = UserService;
