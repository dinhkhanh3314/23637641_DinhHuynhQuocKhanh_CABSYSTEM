const express = require("express");
const {
  createNotification,
  getNotification,
  getNotificationsByRecipient,
  markAsRead,
} = require("../grpc/notificationClient");
const { grpcErrorToHttp } = require("../grpc/grpcError");

const router = express.Router();

function handleError(res, error) {
  console.error(error);
  const mapped = grpcErrorToHttp(error);
  return res.status(mapped.status).json({ message: mapped.message });
}

router.post("/", async (req, res) => {
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

router.get("/recipient/:recipientId", async (req, res) => {
  try {
    const result = await getNotificationsByRecipient(req.params.recipientId);
    res.json({ notifications: result.notifications || [] });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/:id/read", async (req, res) => {
  try {
    res.json({ notification: await markAsRead(req.params.id) });
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    res.json({ notification: await getNotification(req.params.id) });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
