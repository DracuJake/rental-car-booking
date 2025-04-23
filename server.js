const express = require("express");
const dotenv = require("dotenv");
const hospitalRoutes = require("./routes/route");
const authRoutes = require("./routes/auth");
const appointments = require("./routes/appointments");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
dotenv.config({ path: "./config/config.env" });
const rateLimit = require("express-rate-limit");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
//Rate Limiting

const app = express();
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express VacQ API",
      servers: [
        {
          url: 'http://localhost:5003/api/v1',
        },
      ],
    },
  },
  apis: ["./routes/*.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
app.use(cors());
connectDB();
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
// Routes
app.use("/hospitals", hospitalRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/appointments", appointments);

const PORT = process.env.PORT || 5003;
// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
