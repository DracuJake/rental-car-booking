const express = require('express');
const router = express.Router();
const { createRentalProvider, getAllRentalProviders, getRentalProvider, updateRentalProvider, deleteRentalProvider } = require('../controllers/rentalProvider');

router.post('/', createRentalProvider);
router.get('/', getAllRentalProviders);
router.get('/:id', getRentalProvider);
router.put('/:id', updateRentalProvider);
router.delete('/:id', deleteRentalProvider);

module.exports = router;