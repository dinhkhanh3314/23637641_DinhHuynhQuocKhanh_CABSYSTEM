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

function notificationsFromEvent(event) {
  const data = event.data || {};
  const recipients = [
    data.customerId && { recipientId: data.customerId, recipientType: "CUSTOMER" },
    data.driverId && { recipientId: data.driverId, recipientType: "DRIVER" },
  ].filter(Boolean);

  if (recipients.length === 0) {
    throw new Error(`Event ${event.eventType} has no notification recipient`);
  }

  return recipients.map((recipient, index) => ({
    notificationId: Number(`${Date.now()}${index}`.slice(-9)),
    ...recipient,
    type: event.eventType,
    title: event.eventType,
    message: `Event ${event.eventType} was received`,
  }));
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

module.exports = { startNotificationConsumer };
