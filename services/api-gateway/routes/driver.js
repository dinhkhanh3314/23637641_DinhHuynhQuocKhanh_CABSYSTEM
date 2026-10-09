const express = require("express");
const { createDriver, getNearbyDrivers } = require("../grpc/driverClient");
const { grpcErrorToHttp } = require("../grpc/grpcError");

const router = express.Router();

function handleError(res, error) {
  console.error(error);
  const mapped = grpcErrorToHttp(error);
  return res.status(mapped.status).json({ message: mapped.message });
}

router.post("/", async (req, res) => {
  try {
    const driver = await createDriver({
      user_id: req.body.userId,
      full_name: req.body.fullName,
      phone: req.body.phone,
      license_no: req.body.licenseNo,
      vehicle_type: req.body.vehicleType,
      plate_number: req.body.plateNumber,
      brand: req.body.brand,
      model: req.body.model,
      color: req.body.color,
    });
    res.status(201).json(driver);
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/nearby", async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const result = await getNearbyDrivers({
      latitude: Number(latitude),
      longitude: Number(longitude),
      radius: Number(radius),
    });
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
