const express = require('express');
const router = express.Router();
const { createCar, getAllCars, getCarById, updateCar, deleteCar } = require('../controllers/car');
const { checkAdmin } = require('../middleware/auth');

router.post('/',checkAdmin ,createCar);
router.post('/get-by-provider', checkAdmin,getAllCars);
router.get('/:id', checkAdmin,getCarById);
router.put('/:id', checkAdmin,updateCar);
router.delete('/:id', checkAdmin,deleteCar);

module.exports = router;
