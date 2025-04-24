const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} = require("../controllers/booking");

router.post("/", protect, createBooking);
router.get("/", protect, getAllBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id", protect, updateBooking);
router.delete("/:id", protect, deleteBooking);

module.exports = router;
