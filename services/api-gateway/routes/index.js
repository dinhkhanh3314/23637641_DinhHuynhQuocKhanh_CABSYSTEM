const express = require("express");

const authRoutes = require("./auth");
const bookingRoutes = require("./booking");
const customerRoutes = require("./customer");
const driverRoutes = require("./driver");
const tripRoutes = require("./trip");
const paymentRoutes = require("./payment");
const notificationRoutes = require("./notification");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "CABSystem API Gateway",
  });
});

router.use("/auth", authRoutes);
router.use("/bookings", authMiddleware, bookingRoutes);
router.use("/customers", authMiddleware, customerRoutes);
router.use("/drivers", authMiddleware, driverRoutes);
router.use("/trips", authMiddleware, tripRoutes);
router.use("/payments", authMiddleware, paymentRoutes);
router.use("/notifications", authMiddleware, notificationRoutes);

module.exports = router;
