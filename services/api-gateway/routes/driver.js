const express = require("express");
const driverClient = require("../grpc/driverClient");
const { grpcErrorToHttp } = require("../grpc/grpcError");
const { requireRoles } = require("../middlewares/auth");

const router = express.Router();

function handleError(res, error) {
  console.error(error);
  const mapped = grpcErrorToHttp(error);
  return res.status(mapped.status).json({ message: mapped.message });
}

function run(handler) {
  return async (req, res) => {
    try {
      res.json(await handler(req, res));
    } catch (error) {
      handleError(res, error);
    }
  };
}

router.post("/", async (req, res) => {
  try {
    res.status(201).json(await driverClient.createDriver({
      user_id: req.body.userId,
      full_name: req.body.fullName,
      phone: req.body.phone,
      license_no: req.body.licenseNo,
      vehicle_type: req.body.vehicleType,
      plate_number: req.body.plateNumber,
      brand: req.body.brand,
      model: req.body.model,
      color: req.body.color,
    }));
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/applications", run(() => driverClient.getApplications()));
router.get("/applications/:id", run((req) => driverClient.getApplication(req.params.id)));
router.put("/applications/:id/approve", requireRoles("OPERATOR", "ADMIN"), run((req) => driverClient.approveApplication(req.params.id)));
router.put("/applications/:id/reject", requireRoles("OPERATOR", "ADMIN"), run((req) => driverClient.rejectApplication(req.params.id, req.body.note)));
router.put("/applications/:id/resubmit", requireRoles("DRIVER"), run((req) => driverClient.resubmitApplication(req.params.id, req.body)));

router.get("/online", run(() => driverClient.getOnlineDrivers()));
router.get("/nearby", run((req) => driverClient.getNearbyDrivers({
  latitude: Number(req.query.latitude),
  longitude: Number(req.query.longitude),
  radius: Number(req.query.radius),
})));
router.get("/", run(() => driverClient.getDrivers()));
router.get("/:id/location", run((req) => driverClient.getDriverLocation(req.params.id)));
router.get("/:id", run((req) => driverClient.getDriver(req.params.id)));

router.put("/:id/location", run((req) => driverClient.updateDriverLocation(req.params.id, req.body)));
router.put("/:id/online", run((req) => driverClient.goOnline(req.params.id)));
router.put("/:id/offline", run((req) => driverClient.goOffline(req.params.id)));
router.put("/:id", run((req) => driverClient.updateDriver(req.params.id, req.body)));
router.post("/:id/vehicle", run((req) => driverClient.createVehicle(req.params.id, req.body)));
router.put("/:id/vehicle", run((req) => driverClient.updateVehicle(req.params.id, req.body)));

module.exports = router;
