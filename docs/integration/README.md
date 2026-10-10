# Phần 13 - Integration

Phần 13 kiểm tra việc các service chạy cùng nhau. Giao tiếp nội bộ vẫn tuân
theo kiến trúc:

```text
Client HTTP/REST -> API Gateway -> gRPC -> Microservice
Microservice -> Kafka events -> Notification Consumer
```

## Cấu hình cổng

| Thành phần | HTTP | gRPC |
|---|---:|---:|
| API Gateway | 3000 | - |
| Auth | 3001 | 50051 |
| Customer | 3002 | 50052 |
| Driver | 3003 | 50053 |
| Booking | 3004 | 50054 |
| Trip | 3005 | 50055 |
| Payment | 3006 | 50056 |
| Notification | 3007 | 50057 |

## Khởi động

Từ thư mục gốc:

```powershell
docker compose up -d postgres mongodb redis kafka mock-payment-provider
```

Sau đó mở một terminal cho mỗi service và chạy `node server.js` từ chính thư
mục của service. Chạy Notification trước Booking/Payment để consumer Kafka sẵn
sàng nhận event, và chạy API Gateway cuối cùng.

## Smoke test

Sau khi các service đã chạy:

```powershell
node scripts\integration-smoke.js
```

Smoke test gọi `/health` của Gateway và tất cả microservice. Lệnh trả mã lỗi
khác 0 nếu có service không phản hồi hoặc trả HTTP lỗi.

## Kiểm tra nghiệp vụ tích hợp

1. Gửi request qua `http://localhost:3000/api`, không gọi trực tiếp HTTP của
   microservice.
2. Lưu các ID do response trả về: `customerId`, `driverId`, `bookingId`,
   `tripId`, `paymentId`.
3. Tạo booking và kiểm tra Booking Service gọi Driver bằng gRPC.
4. Accept booking và kiểm tra Booking Service gọi Trip bằng gRPC.
5. Tạo/process payment và kiểm tra mock payment provider.
6. Kiểm tra log Notification Service có nhận `BookingCreated`,
   `DriverAccepted`, `PaymentCreated` hoặc `PaymentProcessed`.
7. Đọc notification qua Gateway để xác nhận event đã được lưu vào MongoDB.

Smoke test không tạo dữ liệu nghiệp vụ và không thay thế kiểm thử Postman.
