var GreetingController = require('../controllers/greeting_controller'),
    UsersController = require('../controllers/users_controller'),
    SessionsController = require('../controllers/sessions_controller');


var routes = {
    config: [{
        method: 'GET',
        path: '/api/greeting',
        config: {
            handler: GreetingController.show
        }
    }, {
        method: 'POST',
        path: '/api/users',
        config: {
            auth: false,
            handler: UsersController.create
        }
    }, {
        method: 'GET',
        path: '/api/session',
        config: {
            handler: SessionsController.show
        }
    }, {
        method: 'POST',
        path: '/api/session',
        config: {
            auth: false,
            handler: SessionsController.create
        }
    }, {
        method: 'DELETE',
        path: '/api/session',
        config: {
            handler: SessionsController.delete
        }
    }]
};

module.exports = routes;
