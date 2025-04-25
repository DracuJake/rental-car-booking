const { decode } = require('punycode');
const Booking = require('../models/Booking');
const Car = require('../models/Car');

exports.createBooking = async (req, res) => {
  try {
    const { rentDate, carId } = req.body;
    const userId = req.user.id;
    const userBookings = await Booking.find({ userId });
    if (userBookings.length >= 3) {
      return res.status(400).json({
        success: false,
        msg: 'You have already reached the maximum booking limit (3 bookings).',
      });
    }

    const rentDateOnly = new Date(rentDate);
    rentDateOnly.setHours(0, 0, 0, 0);
    console.log(`book date : ${rentDateOnly}`);

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, msg: 'Car not found' });
    }
    const providerId = car.providerId;

    const bookingsOnSameDate = await Booking.find({
      carId,
      rentDate: rentDateOnly,
    });

    const totalBookedForDate = bookingsOnSameDate.length;

    if (totalBookedForDate >= car.amount) {
      return res.status(400).json({
        success: false,
        msg: `Cannot book car. Only ${car.amount} cars are available and ${totalBookedForDate} are already booked on this date.`,
      });
    }

    const newBooking = await Booking.create({
        rentDate: rentDateOnly,
        userId,
        providerId,
        carId,
      });

    res.status(201).json({
      success: true,
      data: newBooking,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
    try {
      let query;

      const reqQuery = { ...req.query };
      const removeFields = ['select', 'sort', 'page', 'limit'];
      removeFields.forEach(param => delete reqQuery[param]);
  
      let queryStr = JSON.stringify(reqQuery);
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
      query = Booking.find(JSON.parse(queryStr));
  
      if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
      }

      if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
      } else {
        query = query.sort('-createdAt');
      }

      if (req.user.role === 'user') {
        query = query.where('userId').equals(req.user.id);
      }

      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const startIndex = (page - 1) * limit;

      query = query.skip(startIndex).limit(limit);
      const bookings = await query;


      res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
  
  exports.getBookingById = async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
  
      if (!booking) {
        return res.status(404).json({ success: false, msg: 'Booking not found' });
      }
  
      if (req.user.role === 'user' && booking.userId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, msg: 'You can only view your own bookings' });
      }
  
      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
  exports.updateBooking = async (req, res) => {
    try {
      const { rentDate} = req.body;
  
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ success: false, msg: 'Booking not found' });
      }
  
      // check ownership
      if (req.user.role === 'user' && booking.userId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, msg: 'You can only update your own bookings' });
      }
  
      if (rentDate) {
        const car = await Car.findById(booking.carId);
        if (!car) {
          return res.status(404).json({ success: false, msg: 'Car not found' });
        }
  
        const rentDateOnly = new Date(rentDate);
        rentDateOnly.setHours(0, 0, 0, 0);
        console.log(`update date : ${rentDateOnly}`);

        const bookingsOnSameDate = await Booking.find({
            carId : booking.carId,
          rentDate: rentDateOnly,
        });
  
        // check ว่่าวันที่ต้องการอัพเดท สามารถอัพเดทได้มั้ย
        const totalBookedForDate = bookingsOnSameDate.length;
        if (totalBookedForDate >= car.amount) {
          return res.status(400).json({
            success: false,
            msg: `Cannot update booking. Only ${car.amount} cars are available and ${totalBookedForDate} are already booked on ${rentDate}.`,
          });
        }
        const newBody = {
            ...req.body,
            rentDate : rentDateOnly,   
           };
           console.log(newBody);
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            newBody,
            { new: true, runValidators: true }
          );
      
          return res.status(200).json({
            success: true,
            data: updatedBooking
          });
      }
      res.status(400).json({ success: false, error: "Please enter new rentDate to update booking" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  
  exports.deleteBooking = async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res.status(404).json({ success: false, msg: 'Booking not found' });
      }
  
      if (req.user.role === 'user' && booking.userId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, msg: 'You can only delete your own bookings' });
      }
      await booking.deleteOne();
  
      res.status(200).json({
        success: true,
        msg: 'Booking deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  