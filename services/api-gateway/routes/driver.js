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
      const result = await handler(req, res);
      if (!res.headersSent) {
        res.json(result);
      }
    } catch (error) {
      if (!res.headersSent) {
        handleError(res, error);
      }
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

router.get("/online", requireRoles("OPERATOR", "ADMIN"), run(() => driverClient.getOnlineDrivers()));
router.get("/nearby", run(async (req) => {
  const latitude = req.query.lat ?? req.query.latitude;
  const longitude = req.query.lng ?? req.query.longitude;
  const latitudeNumber = Number(latitude);
  const longitudeNumber = Number(longitude);

  if (!Number.isFinite(latitudeNumber) || !Number.isFinite(longitudeNumber)) {
    return res.status(400).json({
      message: "lat and lng are required numeric coordinates",
    });
  }

  const result = await driverClient.getNearbyDrivers({
    latitude: latitudeNumber,
    longitude: longitudeNumber,
    radius: 1,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  return {
    drivers: result.drivers || [],
    pagination: {
      page: result.page || 1,
      limit: result.limit || 20,
      total: result.total || 0,
    },
  };
}));
router.get("/", run(() => driverClient.getDrivers()));
router.get("/:id/location", run((req) => driverClient.getDriverLocation(req.params.id)));
router.get("/:id", run((req) => driverClient.getDriver(req.params.id)));

async function ownDriver(req, res, next) {
  if (req.user.role !== "DRIVER") {
    return res.status(403).json({ message: "Driver role required" });
  }
  try {
    const driver = await driverClient.getDriver(req.params.id);
    if (String(driver.userId) !== String(req.user.userId)) {
      return res.status(403).json({ message: "Driver resource belongs to another user" });
    }
  } catch (error) {
    return handleError(res, error);
  }
  return next();
}

router.put("/:id/location", ownDriver, run((req) => driverClient.updateDriverLocation(req.params.id, req.body)));
router.put("/:id/online", ownDriver, run((req) => driverClient.goOnline(req.params.id)));
router.put("/:id/offline", ownDriver, run((req) => driverClient.goOffline(req.params.id)));
router.put("/:id", ownDriver, run((req) => driverClient.updateDriver(req.params.id, req.body)));
router.post("/:id/vehicle", ownDriver, run((req) => driverClient.createVehicle(req.params.id, req.body)));
router.put("/:id/vehicle", ownDriver, run((req) => driverClient.updateVehicle(req.params.id, req.body)));

module.exports = router;
