import Restify = require('restify');
import userControllers = require('./controllers/users');
import ActivationController = require('./controllers/activation.ctrl');

class routes{

    constructor(app:Restify.Server){

        app.post("/users/login/", userControllers.login);
        app.get("/users/logout", userControllers.logout);
        app.get('/activate/:activate', ActivationController.activate);
    }
}

export = routes;
