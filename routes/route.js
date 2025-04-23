const express = require('express');
const appointmentRouter = require('./appointments');
const router = express.Router();
const hospitalController = require('../controllers/controller');
const {protect} = require('../middleware/auth');

router.get('/', hospitalController.getAllHospitals);
router.get('/:id', hospitalController.getHospital);
router.post('/', protect,hospitalController.createHospital);
router.put('/:id', protect,hospitalController.updateHospital);
router.delete('/:id', protect,hospitalController.deleteHospital);
router.use('/:hospitalId/appointments', appointmentRouter);

module.exports = router;

