var express = require('express');
var router = express.Router();

const resourceController = require('../controllers/resourcesController');

router.get('/', resourceController.getResources);
router.post('/create', resourceController.createResource);
router.delete('/delete/:id', resourceController.deleteResource);
router.patch('/update/:id', resourceController.updateResource);

module.exports = router;