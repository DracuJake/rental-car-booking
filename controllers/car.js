const Car = require('../models/Car');


exports.createCar = async (req, res) => {
    try {
      const { name, amount, providerId, price } = req.body;

      if (!name || !amount || !providerId) {
        return res.status(400).json({ success: false, msg: 'Name, amount, and providerId are required' });
      }
  
      const newCar = new Car({
        name,
        amount,
        providerId,
        price,
      });
  
      await newCar.save();
  
      res.status(201).json({
        success: true,
        data: newCar,
      });
    } catch (err) {
      res.status(500).json({ success: false, msg: 'Server Error' });
    }
  };

exports.getAllCars = async (req, res) => {
    try {
      const { providerId, page, limit } = req.body;
      if (!providerId) {
        return res.status(400).json({ success: false, msg: 'ProviderId is required' });
      }
      
      const currentPage = parseInt(page) || 0;
      const currentLimit = parseInt(limit) || 10;
      const skip = currentPage * currentLimit;
  
      const cars = await Car.find({ providerId })
        .skip(skip)
        .limit(currentLimit)
        .sort("-createdAt");
  
      const totalCount = await Car.countDocuments({ providerId });
  
      res.status(200).json({
        success: true,
        page: currentPage,
        limit: currentLimit,
        count: totalCount,
        data: cars,
      });
    } catch (err) {
      res.status(500).json({ success: false, msg: 'Server Error' });
    }
  };
  
  


exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ success: false, msg: 'Car not found' });
    }

    res.status(200).json({
      success: true,
      data : car,
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
};

exports.updateCar = async (req, res) => {
    try {
      const {name, amount,reservedAmount,price} = req.body;

      const car = await Car.findById(req.params.id);
      
      if (!car) {
        return res.status(404).json({ success: false, msg: 'Car not found' });
      }
  
      if (amount < car.reservedAmount) {
        return res.status(400).json({ success: false, msg: 'Amount cannot be less than reserved amount' });
      }
      const availableAmount = amount - car.reservedAmount;
      const updatedCar = await Car.findByIdAndUpdate(
        req.params.id,
        {
            ...req.body,
            name,
            availableAmount,
            reservedAmount,
            price,
        },
        {
          new: true,
          runValidators: true,
        }
      );
  
      res.status(200).json({ success: true, data: updatedCar });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  

exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ success: false, msg: 'Car not found' });
    }

    if (car.reservedAmount !== 0) {
      return res.status(400).json({ success: false, msg: 'Cannot delete car with reserved amount' });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      msg: 'Car deleted successfully',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
};
