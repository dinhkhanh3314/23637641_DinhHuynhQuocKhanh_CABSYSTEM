const express = require("express");

const {
  getApplications,
  getApplication,
  approveApplication,
  rejectApplication,
} = require("../services/applicationService");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const applications = await getApplications();

    res.json(applications);
  } catch (error) {
    console.error("Get applications error:", error);

    res.status(500).json({
      message: "Không thể lấy danh sách hồ sơ",
    });
  }
});

router.put("/:id/approve", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const application = await approveApplication(id);

    res.json({
      message: "Duyệt hồ sơ thành công",
      application,
    });
  } catch (error) {
    if (error.message === "APPLICATION_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy hồ sơ",
      });
    }

    if (error.message === "APPLICATION_ALREADY_PROCESSED") {
      return res.status(400).json({
        message: "Hồ sơ đã được xử lý",
      });
    }

    console.error("Approve application error:", error);

    res.status(500).json({
      message: "Không thể duyệt hồ sơ",
    });
  }
});

router.put("/:id/reject", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { note } = req.body;

    const application = await rejectApplication(id, note);

    res.json({
      message: "Từ chối hồ sơ thành công",
      application,
    });
  } catch (error) {
    if (error.message === "APPLICATION_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy hồ sơ",
      });
    }

    if (error.message === "APPLICATION_ALREADY_PROCESSED") {
      return res.status(400).json({
        message: "Hồ sơ đã được xử lý",
      });
    }

    console.error("Reject application error:", error);

    res.status(500).json({
      message: "Không thể từ chối hồ sơ",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const application = await getApplication(id);

    if (!application) {
      return res.status(404).json({
        message: "Không tìm thấy hồ sơ",
      });
    }

    res.json(application);
  } catch (error) {
    console.error("Get application error:", error);

    res.status(500).json({
      message: "Không thể lấy thông tin hồ sơ",
    });
  }
});

module.exports = router;
