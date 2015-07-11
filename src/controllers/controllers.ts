import createUserCtrl = require('./create-user.ctrl');
import carpoolCtrl = require('./carpools.ctrl');

module Controllers {
  export var createUser = createUserCtrl.createUser;
  export var getCarpools = carpoolCtrl.getCarpools;
}

export = Controllers;
