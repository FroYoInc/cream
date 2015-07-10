import Restify = require('restify');
import userControllers = require('./controllers/users');
import CreateUserCtrl = require('./controllers/create-user.ctrl');
import c = require("./config");

class routes{

    constructor(server:Restify.Server){


        /*********** User routes ***********/

        server.post("/api/users/login/", userControllers.login);
        server.get("/api/users/logout", userControllers.logout);
        server.post("/api/users", CreateUserCtrl.createUser);


        /*********** Documentation routes ***********/

        // /docs does not render the css correctly, so redirect to /docs/
        server.get('/api/docs/', function(req, res, next){
            res.header('Location', '/api/docs/');
            res.send(302);
        });

        server.get(/\/api\/docs\/?.*/, Restify.serveStatic({
          directory: c.Config.docs.dir,
          default: c.Config.docs.defaultFile
        }));
    }
}

export = routes;
