const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trips');

router.get('/', tripController.getAllTrips);
router.post('/', tripController.createTrip);
router.get('/:id', tripController.getTripById);
router.put('/:id', tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);

module.exports = router;