const { Kafka, logLevel } = require("kafkajs");
const { createNotification } = require("../services/notificationService");

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "notification-service",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  logLevel: logLevel.ERROR,
});

const topics = ["booking.events", "payment.events"];
const admin = kafka.admin();
const consumer = kafka.consumer({
  groupId: process.env.KAFKA_GROUP_ID || "notification-service",
});

function notificationContent(event, recipientType) {
  const data = event.data || {};
  const bookingLabel = data.bookingId ? ` #${data.bookingId}` : "";
  const paymentLabel = data.paymentId ? ` #${data.paymentId}` : "";

  switch (event.eventType) {
    case "BookingCreated":
      if (recipientType === "DRIVER") {
        return {
          title: "Bạn có yêu cầu chuyến xe mới",
          message: `Bạn được đề xuất chuyến xe${bookingLabel}. Vui lòng kiểm tra và phản hồi.`,
        };
      }
      return data.status === "NO_DRIVER"
        ? {
            title: "Đang tìm tài xế",
            message: `Yêu cầu đặt xe${bookingLabel} đã được ghi nhận. Chúng tôi đang tìm tài xế phù hợp.`,
          }
        : {
            title: "Đã nhận yêu cầu đặt xe",
            message: `Yêu cầu đặt xe${bookingLabel} của bạn đã được ghi nhận. Chúng tôi đang tìm tài xế.`,
          };
    case "DriverAccepted":
      return recipientType === "DRIVER"
        ? {
            title: "Bạn đã nhận chuyến xe",
            message: `Bạn đã nhận chuyến xe${bookingLabel}. Chúc bạn có một chuyến đi an toàn.`,
          }
        : {
            title: "Tài xế đã nhận chuyến",
            message: `Tài xế đã nhận chuyến xe${bookingLabel}. Chuyến đi của bạn đã được xác nhận.`,
          };
    case "DriverRejected":
      return recipientType === "DRIVER"
        ? {
            title: "Bạn có yêu cầu chuyến xe mới",
            message: `Bạn được đề xuất chuyến xe${bookingLabel}. Vui lòng kiểm tra và phản hồi.`,
          }
        : {
            title: "Đang tìm tài xế khác",
            message: `Tài xế được đề xuất chưa thể nhận chuyến${bookingLabel}. Chúng tôi đang tìm tài xế khác.`,
          };
    case "BookingCanceled":
      return recipientType === "DRIVER"
        ? {
            title: "Chuyến xe đã bị hủy",
            message: `Chuyến xe${bookingLabel} đã được khách hàng hủy.`,
          }
        : {
            title: "Đã hủy chuyến xe",
            message: `Yêu cầu đặt xe${bookingLabel} của bạn đã được hủy.`,
          };
    case "PaymentCreated":
      return {
        title: "Đã tạo yêu cầu thanh toán",
        message: `Yêu cầu thanh toán${paymentLabel} cho chuyến đi đã được tạo.`,
      };
    case "PaymentProcessed":
      return data.status === "PAID"
        ? {
            title: "Thanh toán thành công",
            message: `Khoản thanh toán${paymentLabel} của bạn đã được xác nhận.`,
          }
        : {
            title: "Thanh toán chưa thành công",
            message: `Khoản thanh toán${paymentLabel} chưa hoàn tất. Vui lòng kiểm tra phương thức thanh toán hoặc thử lại.`,
          };
    default:
      return null;
  }
}

function notificationsFromEvent(event) {
  const data = event.data || {};
  const recipients = [
    data.customerId && { recipientId: data.customerId, recipientType: "CUSTOMER" },
    data.driverId && { recipientId: data.driverId, recipientType: "DRIVER" },
  ].filter(Boolean);

  return recipients.flatMap((recipient, index) => {
    const content = notificationContent(event, recipient.recipientType);
    if (!content) {
      return [];
    }

    return [{
      notificationId: Number(`${Date.now()}${index}`.slice(-9)),
      ...recipient,
      type: event.eventType,
      ...content,
    }];
  });
}

async function startNotificationConsumer() {
  await admin.connect();
  try {
    const existingTopics = await admin.listTopics();
    const missingTopics = topics.filter(
      (topic) => !existingTopics.includes(topic),
    );

    if (missingTopics.length > 0) {
      await admin.createTopics({
        waitForLeaders: true,
        topics: missingTopics.map((topic) => ({
          topic,
          numPartitions: 1,
          replicationFactor: 1,
        })),
      });
    }
  } finally {
    await admin.disconnect();
  }

  await consumer.connect();
  await consumer.subscribe({
    topics,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) {
        return;
      }

      try {
        const event = JSON.parse(message.value.toString());
        const notifications = notificationsFromEvent(event);
        if (notifications.length === 0) {
          console.warn(`No user notification template or recipient for ${topic}/${event.eventType}`);
          return;
        }
        for (const notification of notifications) {
          await createNotification(notification);
        }
        console.log(
          `Notification created from ${topic}/${event.eventType}`,
        );
      } catch (error) {
        console.error(`Kafka notification handling failed on ${topic}:`, error);
      }
    },
  });

  console.log("Notification Kafka consumer is running");
}

module.exports = { startNotificationConsumer, notificationsFromEvent };
