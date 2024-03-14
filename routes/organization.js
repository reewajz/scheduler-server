var express = require('express');
var router = express.Router();

const organizationController = require('../controllers/organizationController');

router.get('/', organizationController.getOrganization);
router.post('/create', organizationController.createOrganization);
router.delete('/delete/:id', organizationController.deleteOrganization);
router.patch('/update/:id', organizationController.updateOrganization);

module.exports = router;