const express = require("express");
const dotenv = require("dotenv");
const hospitalRoutes = require("./routes/route");
const authRoutes = require("./routes/auth");
const appointments = require("./routes/appointments");
const cars = require("./routes/car");
const rentalProviders = require("./routes/rentalProvider");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
dotenv.config({ path: "./config/config.env" });

const app = express();
connectDB();
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/hospitals", hospitalRoutes);
app.use("/auth", authRoutes);
app.use("/appointments", appointments);
app.use("/cars", cars);
app.use("/rentalProviders",rentalProviders);

const PORT = process.env.PORT || 5003;
// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
