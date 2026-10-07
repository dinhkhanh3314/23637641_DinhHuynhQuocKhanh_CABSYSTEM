const express = require("express");

const {
  createNotification,
  getNotification,
  getNotificationsByRecipient,
  markAsRead,
} = require("../services/notificationService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const notification = await createNotification(req.body);

    res.status(201).json({
      message: "Tạo notification thành công",
      notification,
    });
  } catch (error) {
    console.error(error);

    if (
      error.message === "INVALID_NOTIFICATION_ID" ||
      error.message === "INVALID_RECIPIENT_ID" ||
      error.message === "INVALID_RECIPIENT_TYPE" ||
      error.message === "INVALID_NOTIFICATION_TYPE" ||
      error.message === "INVALID_NOTIFICATION_TITLE" ||
      error.message === "INVALID_NOTIFICATION_MESSAGE"
    ) {
      return res.status(400).json({
        message: "Dữ liệu notification không hợp lệ",
      });
    }

    if (error.message === "NOTIFICATION_ALREADY_EXISTS") {
      return res.status(409).json({
        message: "Notification đã tồn tại",
      });
    }

    res.status(500).json({
      message: "Không thể tạo notification",
    });
  }
});

router.get("/recipient/:recipientId", async (req, res) => {
  try {
    const recipientId = Number(req.params.recipientId);

    if (!Number.isInteger(recipientId) || recipientId <= 0) {
      return res.status(400).json({
        message: "recipientId phải là số nguyên lớn hơn 0",
      });
    }

    const notifications = await getNotificationsByRecipient(recipientId);

    res.json({
      notifications,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Không thể lấy danh sách notification",
    });
  }
});

router.put("/:id/read", async (req, res) => {
  try {
    const notification = await markAsRead(req.params.id);

    res.json({
      message: "Đã đánh dấu notification là đã đọc",
      notification,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "NOTIFICATION_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy notification",
      });
    }

    res.status(500).json({
      message: "Không thể cập nhật notification",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const notification = await getNotification(req.params.id);

    res.json({
      notification,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "NOTIFICATION_NOT_FOUND") {
      return res.status(404).json({
        message: "Không tìm thấy notification",
      });
    }

    res.status(500).json({
      message: "Không thể lấy notification",
    });
  }
});

module.exports = router;
