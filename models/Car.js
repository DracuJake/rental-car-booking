const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const carSchema = new Schema({
  name: {
    type: String,
    required: [true, "Car name is required"],
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
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
  reservedAmount: {
    type: Number,
    default: 0,
  },
  availableAmount: {
    type: Number,
    default: function () {
      return this.amount - this.reservedAmount;
    },
  },
});

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
