# CAB System — Conversation Context

## Phạm vi Phần 11

Phần 11 là giao tiếp gRPC của **toàn bộ service và API Gateway**:

```text
Client → API Gateway HTTP/REST → gRPC client → Microservice gRPC server
```

Không đổi Gateway sang gọi HTTP trực tiếp. Kafka là phần sau gRPC.

## Service và cổng

| Thành phần | HTTP | gRPC |
|---|---:|---:|
| API Gateway | 3000 | — |
| Auth Service | 3001 | 50051 |
| Customer Service | 3002 | 50052 |
| Driver Service | 3003 | 50053 |
| Booking Service | 3004 | 50054 |
| Trip Service | 3005 | 50055 |
| Payment Service | 3006 | 50056 |
| Notification Service | 3007 | 50057 |

Infrastructure: PostgreSQL `5432`, MongoDB `27017`, Redis `6379`, Kafka `9092`, mock payment provider `4000`.

## gRPC contracts hiện có

Thư mục: `contracts/grpc`

- `auth.proto`: register/login/OTP/driver password.
- `customer.proto`: `CreateCustomer`.
- `driver.proto`: `CreateDriver`, `GetNearbyDrivers`.
- `booking.proto`: `CreateBooking`, `GetBooking`, `GetBookings`, `UpdateBookingStatus`, `AcceptBooking`, `CancelBooking`, `RejectBooking`.
- `trip.proto`: `CreateTrip`, `GetTrip`, `StartTrip`, `CompleteTrip`.
- `payment.proto`: `CreatePayment`, `GetPayment`, `ProcessPayment`.
- `notification.proto`: `CreateNotification`, `GetNotification`, `GetNotificationsByRecipient`, `MarkAsRead`.

## Service-to-service communication

- Auth → Customer gRPC khi đăng ký customer.
- Auth → Driver gRPC khi đăng ký driver.
- Booking → Driver gRPC để tìm tài xế gần.
- Booking → Trip gRPC khi accept booking.
- Payment gọi mock payment provider bằng HTTP theo nghiệp vụ hiện có.
- Notification hiện cung cấp gRPC server; chưa có event Kafka vì Kafka thuộc Phần 12.

## API Gateway routes đã nối qua gRPC

- `/api/auth`: Auth gRPC.
- `/api/customers`: Customer gRPC.
- `/api/drivers`: Driver gRPC (`create`, `nearby`).
- `/api/bookings`: Booking gRPC, gồm list/get/create/status/accept/cancel/reject.
- `/api/trips`: Trip gRPC, gồm create/get/start/complete.
- `/api/payments`: Payment gRPC, gồm create/get/process.
- `/api/notifications`: Notification gRPC, gồm create/get/list recipient/mark read.

Các client nằm trong `services/api-gateway/grpc`.

## File triển khai quan trọng

- `services/auth-service/grpc/authServer.js`
- `services/customer-service/grpc/customerServer.js`
- `services/driver-service/grpc/driverServer.js`
- `services/booking-service/grpc/bookingServer.js`
- `services/trip-service/grpc/tripServer.js`
- `services/payment-service/grpc/paymentServer.js`
- `services/notification-service/grpc/notificationServer.js`
- `services/api-gateway/routes/index.js`

Payment và Notification đã được thêm dependency `@grpc/grpc-js` và `@grpc/proto-loader`, đồng thời server.js của hai service đã khởi động gRPC server.

## Kiểm thử đã thực hiện

- Syntax check toàn bộ file gRPC/Gateway mới: đạt.
- Problems check proto và file chính: không lỗi.
- Tất cả Gateway routes load được.
- Tất cả Gateway gRPC clients load được.
- Contract method inventory đã xác nhận đủ RPC theo danh sách trên.
- Booking gRPC bind thành công trên `50054`.
- Payment gRPC bind thành công trên `50056`.
- Notification gRPC bind thành công trên `50057`.
- Gateway → Booking smoke test đã chạy: `GET /api/bookings` trả danh sách thật từ database.
- Booking không tồn tại trả đúng gRPC `NOT_FOUND` và HTTP `404`.
- Tạo booking thiếu dữ liệu trả đúng gRPC `INVALID_ARGUMENT`.

## Cách chạy

Mở terminal riêng cho từng service:

```powershell
cd services\auth-service; node server.js
cd services\customer-service; node server.js
cd services\driver-service; node server.js
cd services\booking-service; node server.js
cd services\trip-service; node server.js
cd services\payment-service; node server.js
cd services\notification-service; node server.js
cd services\api-gateway; node server.js
```

Trước đó chạy infrastructure:

```powershell
docker compose up -d
```

## Việc còn lại của Phần 11

1. Chạy Postman end-to-end với tất cả service.
2. Bổ sung thêm RPC Customer/Driver nếu cần expose toàn bộ REST endpoint hiện có, vì contract hiện tại mới bao phủ các RPC cần cho luồng nghiệp vụ chính.
3. Bổ sung test tự động cho từng RPC và mapping lỗi.
4. Chuẩn hóa health check gRPC thực tế và graceful shutdown.
5. Khi gRPC toàn bộ được xác nhận mới chuyển sang Kafka.

Khi gặp lỗi ở cuộc trò chuyện mới, cung cấp service đang chạy, log đầy đủ, URL/method/body Postman, status hoặc gRPC code và ID nghiệp vụ liên quan.
