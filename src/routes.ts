import Restify = require('restify');
import userControllers = require('./controllers/users');

class routes{

    constructor(app:Restify.Server){
        
        app.get("/users/login/", userControllers.login);
        app.get("/users/logout", userControllers.logout);
    }
}

export = routes;
