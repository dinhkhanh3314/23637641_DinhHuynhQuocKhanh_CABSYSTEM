const { Kafka, Partitioners } = require("kafkajs");

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "payment-service",
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});
let connected = false;
let eventSequence = 0;

async function publishEvent(topic, eventType, data) {
  try {
    if (!connected) {
      await producer.connect();
      connected = true;
    }

    await producer.send({
      topic,
      messages: [
        {
          key: String(data.paymentId || data.id || Date.now()),
          value: JSON.stringify({
            eventId: `${Date.now()}-${++eventSequence}`,
            eventType,
            occurredAt: new Date().toISOString(),
            source: "payment-service",
            data,
          }),
        },
      ],
    });
  } catch (error) {
    console.error(`Kafka publish failed for ${eventType}:`, error);
  }
}

module.exports = { publishEvent };
