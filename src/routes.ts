import Restify = require('restify');
import userControllers = require('./controllers/users');
import ActivationController = require('./controllers/activation.ctrl');
import CreateUserCtrl = require('./controllers/create-user.ctrl');
import carpoolCtrl = require('./controllers/carpools');
import c = require("./config");

class routes{

    constructor(server:Restify.Server){


        /*********** User routes ***********/

        server.post("/users/login/", userControllers.login);
        server.get("/users/logout", userControllers.logout);
        server.post("/users", CreateUserCtrl.createUser);
        server.get('/activate/:activate', ActivationController.activate);


        /*********** Carppool Routes ***********/
        server.post("/api/carpools/:id/participants", carpoolCtrl.requestToJoin);
        server.post("/api/carpools/:id/participants/:carpoolID/join", carpoolCtrl.approveRequest);
        // server.post("/api/carpools/:id/participants/:carpoolID/reject", carpoolCtrl.denyRequest);

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
