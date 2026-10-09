const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const definition = protoLoader.loadSync(
  path.join(__dirname, "../../../contracts/grpc/notification.proto"),
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true },
);
const notificationProto = grpc.loadPackageDefinition(definition).notification;
const client = new notificationProto.NotificationService(
  process.env.NOTIFICATION_GRPC_ADDRESS || "localhost:50057",
  grpc.credentials.createInsecure(),
);

function call(method, request) {
  return new Promise((resolve, reject) => {
    client[method](request, (error, response) => {
      if (error) return reject(error);
      resolve(response);
    });
  });
}

function createNotification(data) {
  return call("CreateNotification", data);
}

function getNotification(id) {
  return call("GetNotification", { id: Number(id) });
}

function getNotificationsByRecipient(recipientId) {
  return call("GetNotificationsByRecipient", {
    recipient_id: Number(recipientId),
  });
}

function markAsRead(id) {
  return call("MarkAsRead", { id: Number(id) });
}

module.exports = {
  createNotification,
  getNotification,
  getNotificationsByRecipient,
  markAsRead,
};
