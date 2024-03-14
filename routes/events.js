module.exports = function (db) {
    var express = require('express');
    var router = express.Router();
        
    const eventsController = require('../controllers/eventsController')(db);
    
    router.get('/', eventsController.getEvents);
    router.post('/create', eventsController.createEvent);
    router.delete('/delete/:id', eventsController.deleteEvent);
    router.patch('/update/:id', eventsController.updateEvent);    
    router.get('/selectResource', eventsController.selectResource);
    router.get('/resourceAvailability', eventsController.getResourceAvailability);

    return router;
}
