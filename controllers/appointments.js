const Appointment = require('../models/Appointment');

// @desc    Get all appointments
// @route   GET /api/v1/appointments
// @access  Public
exports.getAppointments = async (req, res, next) => {
    let query;
    if (req.user.role !== 'admin') { 
        query = Appointment.find({ user: req.user.id }).populate({
            path: 'hospital',
            select: 'name province tel'
        });
    } else { 
        query = Appointment.find().populate({
            path: 'hospital',
            select: 'name province tel'
        });
    }

    try {
        const appointments = await query;

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot find Appointment"
        });
    }
};
