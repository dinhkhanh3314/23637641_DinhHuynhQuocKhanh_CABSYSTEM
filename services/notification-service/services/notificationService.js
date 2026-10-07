const Notification = require("../models/notification");

async function createNotification(data) {
  const notificationId = Number(data.notificationId);
  const recipientId = Number(data.recipientId);
  const recipientType = data.recipientType;
  const type = data.type;
  const title = data.title;
  const message = data.message;

  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    throw new Error("INVALID_NOTIFICATION_ID");
  }

  if (!Number.isInteger(recipientId) || recipientId <= 0) {
    throw new Error("INVALID_RECIPIENT_ID");
  }

  if (!["CUSTOMER", "DRIVER"].includes(recipientType)) {
    throw new Error("INVALID_RECIPIENT_TYPE");
  }

  if (!type || !type.trim()) {
    throw new Error("INVALID_NOTIFICATION_TYPE");
  }

  if (!title || !title.trim()) {
    throw new Error("INVALID_NOTIFICATION_TITLE");
  }

  if (!message || !message.trim()) {
    throw new Error("INVALID_NOTIFICATION_MESSAGE");
  }

  const existingNotification = await Notification.findOne({
    notificationId,
  });

  if (existingNotification) {
    throw new Error("NOTIFICATION_ALREADY_EXISTS");
  }

  const notification = await Notification.create({
    notificationId,
    recipientId,
    recipientType,
    type,
    title,
    message,
    status: "UNREAD",
  });

  return notification;
}

async function getNotification(notificationId) {
  const notification = await Notification.findOne({
    notificationId: Number(notificationId),
  });

  if (!notification) {
    throw new Error("NOTIFICATION_NOT_FOUND");
  }

  return notification;
}

async function getNotificationsByRecipient(recipientId) {
  return Notification.find({
    recipientId: Number(recipientId),
  }).sort({
    createdAt: -1,
  });
}

async function markAsRead(notificationId) {
  const notification = await Notification.findOneAndUpdate(
    {
      notificationId: Number(notificationId),
    },
    {
      status: "READ",
    },
    {
      new: true,
    },
  );

  if (!notification) {
    throw new Error("NOTIFICATION_NOT_FOUND");
  }

  return notification;
}

module.exports = {
  createNotification,
  getNotification,
  getNotificationsByRecipient,
  markAsRead,
};
