import Restify = require('restify');
import userControllers = require('./controllers/users');
import ActivationController = require('./controllers/activation.ctrl');
import CreateUserCtrl = require('./controllers/create-user.ctrl');
import carpoolCtrl = require('./controllers/carpools');
import CarpoolCtrl = require('./controllers/carpool.ctrl');
import CampusCtrl = require('./controllers/campus.ctrl');
import c = require("./config");

class routes{

    constructor(server:Restify.Server){


        /*********** User routes ***********/
        server.post("/api/users/login/", userControllers.login);
        server.get("/api/users/logout", userControllers.logout);
        server.post("/api/users", CreateUserCtrl.createUser);
        server.get('/api/activate/:activate', ActivationController.activate);

        /*********** Carpool routes ***********/
        server.post('/api/carpools', CarpoolCtrl.createCarpool);
        server.get('/api/carpools', CarpoolCtrl.getCarpools);
        server.get('/api/carpools/:carpoolid', CarpoolCtrl.getCarpool);
        server.post("/api/carpools/:id/participants", carpoolCtrl.requestToJoin);
        server.post("/api/carpools/:id/participants/:carpoolID/join", carpoolCtrl.approveRequest);
        // server.post("/api/carpools/:id/participants/:carpoolID/reject", carpoolCtrl.denyRequest);

        /*********** Campus routes ************/
        server.post('/api/campuses', CampusCtrl.createCampus);
        server.get('/api/campuses', CampusCtrl.listCampuses);


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
