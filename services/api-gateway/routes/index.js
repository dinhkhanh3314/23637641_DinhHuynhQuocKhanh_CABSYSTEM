const express = require("express");

const authRoutes = require("./auth");
const bookingRoutes = require("./booking");
const customerRoutes = require("./customer");
const driverRoutes = require("./driver");
const tripRoutes = require("./trip");
const paymentRoutes = require("./payment");
const notificationRoutes = require("./notification");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "CABSystem API Gateway",
  });
});

router.use("/auth", authRoutes);
router.use("/bookings", bookingRoutes);
router.use("/customers", customerRoutes);
router.use("/drivers", driverRoutes);
router.use("/trips", tripRoutes);
router.use("/payments", paymentRoutes);
router.use("/notifications", notificationRoutes);

module.exports = router;
