import createUserCtrl = require('./create-user.ctrl');
import carpoolCtrl = require('./carpool.ctrl');

module Controllers {
  export var createUser = createUserCtrl.createUser;
  export var getCarpools = carpoolCtrl.getCarpools;
}

export = Controllers;
