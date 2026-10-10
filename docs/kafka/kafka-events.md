# Kafka - Phần 12

Kafka dùng cho giao tiếp bất đồng bộ. Các request cần response ngay vẫn đi qua
Gateway và gRPC; không dùng Kafka để thay thế luồng synchronous này.

## Topics và event

| Topic | Producer | Event |
|---|---|---|
| `booking.events` | Booking Service | `BookingCreated`, `DriverAccepted`, `DriverRejected`, `BookingCanceled` |
| `payment.events` | Payment Service | `PaymentCreated`, `PaymentProcessed` |

Event dùng envelope:

```json
{
  "eventId": "timestamp-sequence",
  "eventType": "BookingCreated",
  "occurredAt": "2026-10-10T00:00:00.000Z",
  "source": "booking-service",
  "data": {}
}
```

Notification Service chạy consumer group `notification-service`, nhận các topic
trên và lưu notification vào MongoDB. Event có thể tạo notification cho cả
Customer và Driver nếu payload có đủ recipient ID.

## Cấu hình

### Khi chạy trong Compose

```env
KAFKA_BROKERS=kafka:9092
KAFKA_GROUP_ID=notification-service
```

### Khi chạy service trực tiếp trên host

```env
KAFKA_BROKERS=localhost:9092
```

Không dùng `localhost:9092` bên trong container vì `localhost` khi đó trỏ vào
chính container service, không trỏ tới Kafka.

## Kiểm tra

```powershell
docker compose ps kafka notification-service
docker compose logs --tail=100 kafka notification-service
```

Sau khi tạo booking hoặc payment, cần thấy log consumer xử lý event và tạo
notification. Có thể đọc notification qua Gateway:

```http
GET http://localhost:3000/api/notifications/recipient/{recipientId}
Authorization: Bearer <jwt-token>`
```

## Giới hạn hiện tại

Producer publish sau khi database ghi thành công. Đây chưa phải transactional
outbox; nếu service dừng giữa hai thao tác, event có thể cần cơ chế phát lại.
