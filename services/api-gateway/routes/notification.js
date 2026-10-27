const express = require("express");
const {
  createNotification,
  getNotification,
  getNotificationsByRecipient,
  markAsRead,
} = require("../grpc/notificationClient");
const { grpcErrorToHttp } = require("../grpc/grpcError");
const { requireRoles } = require("../middlewares/auth");

const router = express.Router();

function handleError(res, error) {
  console.error(error);
  const mapped = grpcErrorToHttp(error);
  return res.status(mapped.status).json({ message: mapped.message });
}

router.post("/", requireRoles("OPERATOR", "ADMIN"), async (req, res) => {
  try {
    res.status(201).json({ notification: await createNotification({
      notification_id: req.body.notificationId,
      recipient_id: req.body.recipientId,
      recipient_type: req.body.recipientType,
      type: req.body.type,
      title: req.body.title,
      message: req.body.message,
    }) });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/recipient/:recipientId", requireRoles("CUSTOMER", "DRIVER", "OPERATOR", "ADMIN"), async (req, res) => {
  try {
    const recipientType = ["CUSTOMER", "DRIVER"].includes(req.user.role)
      ? req.user.role
      : "";
    const result = await getNotificationsByRecipient(
      req.params.recipientId,
      recipientType,
    );
    res.json({ notifications: result.notifications || [] });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/recipient/:recipientType/:recipientId", requireRoles("CUSTOMER", "DRIVER", "OPERATOR", "ADMIN"), async (req, res) => {
  const { recipientType } = req.params;
  const recipientId = Number(req.params.recipientId);
  if (!["CUSTOMER", "DRIVER"].includes(recipientType) || !Number.isInteger(recipientId) || recipientId <= 0) {
    return res.status(400).json({ message: "recipientType must be CUSTOMER or DRIVER and recipientId must be a positive integer" });
  }
  if (["CUSTOMER", "DRIVER"].includes(req.user.role) && recipientType !== req.user.role) {
    return res.status(403).json({ message: "Cannot list notifications for another role" });
  }

  try {
    const result = await getNotificationsByRecipient(recipientId, recipientType);
    return res.json({ notifications: result.notifications || [] });
  } catch (error) {
    return handleError(res, error);
  }
});

router.put("/:id/read", requireRoles("CUSTOMER", "DRIVER", "OPERATOR", "ADMIN"), async (req, res) => {
  try {
    const notification = await getNotification(req.params.id);
    if (
      !["OPERATOR", "ADMIN"].includes(req.user.role) &&
      notification.recipient_type !== req.user.role
    ) {
      return res.status(403).json({ message: "Notification belongs to another role" });
    }
    res.json({ notification: await markAsRead(req.params.id) });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/:id", requireRoles("CUSTOMER", "DRIVER", "OPERATOR", "ADMIN"), async (req, res) => {
  try {
    const notification = await getNotification(req.params.id);
    if (
      !["OPERATOR", "ADMIN"].includes(req.user.role) &&
      notification.recipient_type !== req.user.role
    ) {
      return res.status(403).json({ message: "Notification belongs to another role" });
    }
    res.json({ notification });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
