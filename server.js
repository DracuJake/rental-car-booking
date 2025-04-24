const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const cars = require("./routes/car");
const rentalProviders = require("./routes/rentalProvider");
const bookings = require("./routes/booking");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
dotenv.config({ path: "./config/config.env" });

const app = express();
connectDB();
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/auth", authRoutes);
app.use("/cars", cars);
app.use("/rentalProviders",rentalProviders);
app.use("/bookings",bookings);

const PORT = process.env.PORT || 5003;
// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
