import createUserCtrl = require('./create-user.ctrl');
import carpoolCtrl = require('./carpool.ctrl');
import campusCtrl = require('./campus.ctrl');

module Controllers {
  export var createUser = createUserCtrl.createUser;
  export var getCarpools = carpoolCtrl.getCarpools;
  export var createCampus = campusCtrl.createCampus;
  export var getCampusList = campusCtrl.listCampuses;
}

export = Controllers;
