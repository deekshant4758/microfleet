const express = require('express');
const router = express.Router();
const driverController = require('../controllers/drivers');

router.get('/', driverController.getAllDrivers);
router.post('/', driverController.createDriver);
router.get('/:id', driverController.getDriverById);
router.put('/:id', driverController.updateDriver);
router.post('/:id/assign-vehicle', driverController.assignVehicle);
router.post('/:id/unassign-vehicle', driverController.unassignVehicle);
router.delete('/:id', driverController.deleteDriver);

module.exports = router;