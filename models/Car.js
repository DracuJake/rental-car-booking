const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const carSchema = new Schema({
  name: {
    type: String,
    required: [true, "Car name is required"],
  },
  amount: {
    type: Number,
    default: 1,
  },
  price: {
    type: Number,
    default: 0,
  },
  providerId: {
    type: mongoose.Schema.ObjectId,
    ref: "RentalProvider",
    required: true,
  },
});

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
