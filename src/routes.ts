import Restify = require('restify');
import userControllers = require('./controllers/users');
import ActivationController = require('./controllers/activation.ctrl');
import CreateUserCtrl = require('./controllers/create-user.ctrl');
import CarpoolCtrl = require('./controllers/carpool.ctrl');
import c = require("./config");

class routes{

    constructor(server:Restify.Server){


        /*********** User routes ***********/
        server.post("/users/login/", userControllers.login);
        server.get("/users/logout", userControllers.logout);
        server.post("/users", CreateUserCtrl.createUser);
        server.get('/activate/:activate', ActivationController.activate);

        /*********** Carpool routes ***********/
        server.post('/carpools', CarpoolCtrl.createCarpool);
        server.get('/carpools/:carpoolid', CarpoolCtrl.getCarpool);

        /*********** Documentation routes ***********/

        // /docs does not render the css correctly, so redirect to /docs/
        server.get('/docs', function(req, res, next){
            res.header('Location', '/docs/');
            res.send(302);
        });

        server.get(/\/docs\/?.*/, Restify.serveStatic({
          directory: c.Config.docs.dir,
          default: c.Config.docs.defaultFile
        }));
    }
}

export = routes;
