require("dotenv").config();

const express = require("express");

const bookingRoutes = require("./routes/booking");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    service: "booking-service",
    status: "OK",
  });
});

app.use("/bookings", bookingRoutes);

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`Booking Service running on port ${PORT}`);
});
