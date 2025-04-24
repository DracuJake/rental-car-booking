const RentalProvider = require("../models/RentalProvider");
const Car = require("../models/Car");
const Booking = require("../models/Booking");

exports.getAllRentalProviders = async (req, res) => {
  try {
    let query;
    const reqQuery = { ...req.query };
    const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((param) => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );
    query = RentalProvider.find(JSON.parse(queryStr));

    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await RentalProvider.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const rentalProviders = await query;

    res.status(200).json({
      success: true,
      count: rentalProviders.length,
      data: rentalProviders,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getRentalProvider = async (req, res) => {
  try {
    const rentalProvider = await RentalProvider.findById(req.params.id).lean();
    if (!rentalProvider) {
      return res
        .status(404)
        .json({ success: false, msg: "RentalProvider not found" });
    }
    //search Car
    const cars = await Car.find({providerId : req.params.id});
    totalCar = 0;
    cars.forEach(car => {
        totalCar += car.amount;
      });
    res.status(200).json({ success: true, data: {...rentalProvider,totalCar : totalCar}});
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createRentalProvider = async (req, res) => {
  try {
    const rentalProvider = await RentalProvider.create(req.body);
    res.status(201).json({ success: true, data: rentalProvider });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateRentalProvider = async (req, res) => {
  try {
    const rentalProvider = await RentalProvider.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!rentalProvider) {
      return res
        .status(404)
        .json({ success: false, msg: "RentalProvider not found" });
    }
    res.status(200).json({ success: true, data: rentalProvider });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteRentalProvider = async (req, res) => {
  try {
    const rentalProvider = await RentalProvider.findByIdAndDelete(
      req.params.id
    );
    if (!rentalProvider) {
      return res
        .status(404)
        .json({ success: false, msg: "RentalProvider not found" });
    }
    // Cascade delete
    await Booking.deleteMany({ providerId: rentalProvider._id });
    await Car.deleteMany({ providerId: rentalProvider._id });
    res
      .status(200)
      .json({ success: true, msg: "RentalProvider deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
