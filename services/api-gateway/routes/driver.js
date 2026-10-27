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

router.post("/", requireRoles("OPERATOR", "ADMIN"), async (req, res) => {
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

router.get("/applications", requireRoles("OPERATOR", "ADMIN"), run(() => driverClient.getApplications()));
router.get("/applications/:id", requireRoles("OPERATOR", "ADMIN"), run((req) => driverClient.getApplication(req.params.id)));
router.put("/applications/:id/approve", requireRoles("OPERATOR", "ADMIN"), run((req) => driverClient.approveApplication(req.params.id)));
router.put("/applications/:id/reject", requireRoles("OPERATOR", "ADMIN"), run((req) => driverClient.rejectApplication(req.params.id, req.body.note)));
router.put("/applications/:id/resubmit", requireRoles("DRIVER"), run((req) => driverClient.resubmitApplication(req.params.id, req.body)));

router.get("/online", requireRoles("DRIVER", "OPERATOR", "ADMIN"), run(() => driverClient.getOnlineDrivers()));
router.get("/nearby", requireRoles("CUSTOMER", "DRIVER", "OPERATOR", "ADMIN"), run(async (req, res) => {
  const latitude = req.query.lat ?? req.query.latitude;
  const longitude = req.query.lng ?? req.query.longitude;
  const latitudeNumber = Number(latitude);
  const longitudeNumber = Number(longitude);

  if (
    !Number.isFinite(latitudeNumber) ||
    latitudeNumber < -90 ||
    latitudeNumber > 90 ||
    !Number.isFinite(longitudeNumber) ||
    longitudeNumber < -180 ||
    longitudeNumber > 180
  ) {
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
router.get("/", requireRoles("CUSTOMER", "DRIVER", "OPERATOR", "ADMIN"), run(() => driverClient.getDrivers()));
router.get("/:id/location", requireRoles("CUSTOMER", "DRIVER", "OPERATOR", "ADMIN"), run((req) => driverClient.getDriverLocation(req.params.id)));
router.get("/:id", requireRoles("CUSTOMER", "DRIVER", "OPERATOR", "ADMIN"), run((req) => driverClient.getDriver(req.params.id)));

router.put("/:id/location", requireRoles("DRIVER"), run((req) => driverClient.updateDriverLocation(req.params.id, req.body)));
router.put("/:id/online", requireRoles("DRIVER"), run((req) => driverClient.goOnline(req.params.id)));
router.put("/:id/offline", requireRoles("DRIVER"), run((req) => driverClient.goOffline(req.params.id)));
router.put("/:id", requireRoles("DRIVER"), run((req) => driverClient.updateDriver(req.params.id, req.body)));
router.post("/:id/vehicle", requireRoles("DRIVER"), run((req) => driverClient.createVehicle(req.params.id, req.body)));
router.put("/:id/vehicle", requireRoles("DRIVER"), run((req) => driverClient.updateVehicle(req.params.id, req.body)));

module.exports = router;
