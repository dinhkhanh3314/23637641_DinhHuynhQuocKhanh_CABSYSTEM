const express = require("express");
const router = express.Router();

const {
  createDriver,
  getDriver,
  getDrivers,
  updateDriver,
  createVehicle,
  updateVehicle,
  goOnline,
  goOffline,
  getOnlineDrivers,
  updateDriverLocation,
  getDriverLocation,
  getNearbyDrivers,
} = require("../services/driverService");

router.post("/", async (req, res) => {
  try {
    const driver = await createDriver(req.body);
    res.status(201).json(driver);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Không thể tạo hồ sơ tài xế",
    });
  }
});

router.get("/online", async (req, res) => {
  try {
    const drivers = await getOnlineDrivers();

    res.json({
      drivers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Không thể lấy danh sách tài xế đang online",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const drivers = await getDrivers();

    res.json({
      drivers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Không thể lấy danh sách tài xế",
    });
  }
});

router.put("/:id/location", async (req, res) => {
  try {
    const { longitude, latitude } = req.body;

    if (longitude === undefined || latitude === undefined) {
      return res.status(400).json({
        message: "Vui lòng nhập longitude và latitude",
      });
    }

    const result = await updateDriverLocation(
      Number(req.params.id),
      longitude,
      latitude,
    );

    res.json(result);
  } catch (error) {
    if (error.message === "DRIVER_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy tài xế",
      });
    }

    if (error.message === "DRIVER_NOT_ONLINE") {
      return res.status(400).json({
        message: "Tài xế chưa online",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Không thể cập nhật vị trí tài xế",
    });
  }
});

router.get("/:id/location", async (req, res) => {
  try {
    const result = await getDriverLocation(Number(req.params.id));

    res.json(result);
  } catch (error) {
    if (error.message === "DRIVER_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy tài xế",
      });
    }

    if (error.message === "LOCATION_NOT_FOUND") {
      return res.status(404).json({
        message: "Tài xế chưa có vị trí",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Không thể lấy vị trí tài xế",
    });
  }
});

router.get("/nearby", async (req, res) => {
  try {
    const { longitude, latitude, radius } = req.query;

    if (
      longitude === undefined ||
      latitude === undefined ||
      radius === undefined
    ) {
      return res.status(400).json({
        message: "Vui lòng nhập longitude, latitude và radius",
      });
    }

    const drivers = await getNearbyDrivers(latitude, longitude, radius);

    res.json({
      drivers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Không thể tìm tài xế gần vị trí",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const driver = await getDriver(id);

    if (!driver) {
      return res.status(404).json({
        message: "Không tìm thấy tài xế",
      });
    }

    res.json(driver);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Không thể lấy thông tin tài xế",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const driver = await updateDriver(id, req.body);

    res.json(driver);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Không thể cập nhật tài xế",
    });
  }
});

router.post("/:id/vehicle", async (req, res) => {
  try {
    const driverId = Number(req.params.id);

    const vehicle = await createVehicle(driverId, req.body);

    res.status(201).json(vehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Không thể tạo thông tin xe",
    });
  }
});

router.put("/:id/vehicle", async (req, res) => {
  try {
    const driverId = Number(req.params.id);

    const vehicle = await updateVehicle(driverId, req.body);

    res.json(vehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Không thể cập nhật thông tin xe",
    });
  }
});

router.put("/:id/online", async (req, res) => {
  try {
    const driver = await goOnline(Number(req.params.id));

    res.json({
      message: "Tài xế đã Online",
      ...driver,
    });
  } catch (error) {
    if (error.message === "DRIVER_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy tài xế",
      });
    }

    if (error.message === "DRIVER_NOT_APPROVED") {
      return res.status(400).json({
        message: "Tài xế chưa được duyệt hồ sơ",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Không thể chuyển tài xế sang Online",
    });
  }
});

router.put("/:id/offline", async (req, res) => {
  try {
    const driver = await goOffline(Number(req.params.id));

    res.json({
      message: "Tài xế đã Offline",
      ...driver,
    });
  } catch (error) {
    if (error.message === "DRIVER_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy tài xế",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Không thể chuyển tài xế sang Offline",
    });
  }
});

module.exports = router;
