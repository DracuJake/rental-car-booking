const express = require('express');
const router = express.Router();
const { checkAdmin } = require('../middleware/auth');
const { createRentalProvider, getAllRentalProviders, getRentalProvider, updateRentalProvider, deleteRentalProvider } = require('../controllers/rentalProvider');

router.post('/',checkAdmin ,createRentalProvider);
router.get('/', getAllRentalProviders);
router.get('/:id', getRentalProvider);
router.put('/:id', checkAdmin,updateRentalProvider);
router.delete('/:id', checkAdmin,deleteRentalProvider);

module.exports = router;