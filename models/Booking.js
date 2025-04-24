const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    rentDate: {
        type: Date,
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    providerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'RentalProvider',
        required: true
    },
    carId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Car',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);
