# Kafka - Phần 12

Kafka được dùng cho giao tiếp bất đồng bộ; gRPC vẫn được dùng cho các request
đồng bộ giữa Gateway và microservice.

## Topics và event

| Topic | Producer | Event hiện có |
|---|---|---|
| `booking.events` | Booking Service | `BookingCreated`, `DriverAccepted`, `DriverRejected` |
| `payment.events` | Payment Service | `PaymentCreated`, `PaymentProcessed` |

Event có envelope thống nhất:

```json
{
  "eventId": "timestamp-sequence",
  "eventType": "BookingCreated",
  "occurredAt": "2026-01-01T00:00:00.000Z",
  "source": "booking-service",
  "data": {}
}
```

Notification Service chạy consumer group `notification-service`, nhận hai topic
trên và tạo notification trong MongoDB. Consumer bỏ qua message rỗng và ghi log
khi event sai hoặc không có recipient.

## Cấu hình

Các service dùng biến:

```env
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=booking-service
KAFKA_GROUP_ID=notification-service
```

Kafka được khởi động bởi Docker Compose. Các service Node.js vẫn chạy trực tiếp
bằng `node server.js` từ thư mục service tương ứng.

## Giới hạn hiện tại

Producer publish sau khi database ghi thành công. Đây chưa phải transactional
outbox, vì vậy nếu service dừng giữa hai thao tác thì event có thể cần được phát
lại bằng cơ chế outbox ở bước hardening/integration sau.
