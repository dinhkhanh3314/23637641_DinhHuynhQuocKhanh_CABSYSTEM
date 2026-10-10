const { Kafka } = require("kafkajs");
const { createNotification } = require("../services/notificationService");

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "notification-service",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
});

const consumer = kafka.consumer({
  groupId: process.env.KAFKA_GROUP_ID || "notification-service",
});

function notificationFromEvent(event) {
  const data = event.data || {};
  const recipientId = data.customerId || data.driverId;

  if (!recipientId) {
    throw new Error(`Event ${event.eventType} has no notification recipient`);
  }

  const notificationId = Number(
    String(Date.now()).slice(-9),
  );

  return {
    notificationId,
    recipientId,
    recipientType: data.driverId ? "DRIVER" : "CUSTOMER",
    type: event.eventType,
    title: event.eventType,
    message: `Event ${event.eventType} was received`,
  };
}

async function startNotificationConsumer() {
  await consumer.connect();
  await consumer.subscribe({
    topics: ["booking.events", "payment.events"],
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) {
        return;
      }

      try {
        const event = JSON.parse(message.value.toString());
        const notification = notificationFromEvent(event);
        await createNotification(notification);
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

module.exports = { startNotificationConsumer };
