const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const {
  createNotification,
  getNotification,
  getNotificationsByRecipient,
  markAsRead,
} = require("../services/notificationService");

const PROTO_PATH = path.join(
  __dirname,
  "../../../contracts/grpc/notification.proto",
);

const definition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const notificationProto = grpc.loadPackageDefinition(definition).notification;

function toNotificationResponse(notification) {
  return {
    notification_id: notification.notificationId,
    recipient_id: notification.recipientId,
    recipient_type: notification.recipientType,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    status: notification.status,
    created_at: notification.createdAt
      ? notification.createdAt.toISOString()
      : "",
    updated_at: notification.updatedAt
      ? notification.updatedAt.toISOString()
      : "",
  };
}

function mapError(error) {
  const invalidErrors = new Set([
    "INVALID_NOTIFICATION_ID",
    "INVALID_RECIPIENT_ID",
    "INVALID_RECIPIENT_TYPE",
    "INVALID_NOTIFICATION_TYPE",
    "INVALID_NOTIFICATION_TITLE",
    "INVALID_NOTIFICATION_MESSAGE",
  ]);

  return {
    code: invalidErrors.has(error.message)
      ? grpc.status.INVALID_ARGUMENT
      : error.message === "NOTIFICATION_ALREADY_EXISTS"
        ? grpc.status.ALREADY_EXISTS
        : error.message === "NOTIFICATION_NOT_FOUND"
          ? grpc.status.NOT_FOUND
          : grpc.status.INTERNAL,
    message: error.message || "INTERNAL_ERROR",
  };
}

async function CreateNotification(call, callback) {
  try {
    const notification = await createNotification({
      notificationId: call.request.notification_id,
      recipientId: call.request.recipient_id,
      recipientType: call.request.recipient_type,
      type: call.request.type,
      title: call.request.title,
      message: call.request.message,
    });
    callback(null, toNotificationResponse(notification));
  } catch (error) {
    console.error("CreateNotification gRPC error:", error);
    callback(mapError(error));
  }
}

async function GetNotification(call, callback) {
  try {
    callback(
      null,
      toNotificationResponse(await getNotification(call.request.id)),
    );
  } catch (error) {
    console.error("GetNotification gRPC error:", error);
    callback(mapError(error));
  }
}

async function GetNotificationsByRecipient(call, callback) {
  try {
    const notifications = await getNotificationsByRecipient(
      call.request.recipient_id,
    );
    callback(null, {
      notifications: notifications.map(toNotificationResponse),
    });
  } catch (error) {
    console.error("GetNotificationsByRecipient gRPC error:", error);
    callback(mapError(error));
  }
}

async function MarkAsRead(call, callback) {
  try {
    callback(null, toNotificationResponse(await markAsRead(call.request.id)));
  } catch (error) {
    console.error("MarkAsRead gRPC error:", error);
    callback(mapError(error));
  }
}

function startNotificationGrpcServer() {
  const server = new grpc.Server();
  server.addService(notificationProto.NotificationService.service, {
    CreateNotification,
    GetNotification,
    GetNotificationsByRecipient,
    MarkAsRead,
  });

  const port = process.env.NOTIFICATION_GRPC_PORT || "50057";
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error, boundPort) => {
      if (error) {
        console.error("Notification gRPC server error:", error);
        return;
      }
      console.log(
        `Notification gRPC Server running on port ${boundPort}`,
      );
    },
  );
}

module.exports = { startNotificationGrpcServer };
