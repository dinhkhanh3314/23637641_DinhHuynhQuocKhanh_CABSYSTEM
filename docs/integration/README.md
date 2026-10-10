# Integration và Docker Compose

## 1. Kiến trúc runtime

```text
Client/Postman
    -> HTTP/REST API Gateway :3000
    -> gRPC trong Docker network
    -> Microservices
    -> PostgreSQL/MongoDB/Redis
    -> Kafka events
    -> Notification Consumer
```

Client không gọi trực tiếp HTTP của microservice trong luồng demo chính.

## 2. Cổng

| Thành phần | HTTP | gRPC |
|---|---:|---:|
| API Gateway | `3000` | - |
| Auth Service | nội bộ | `50051` |
| Customer Service | nội bộ | `50052` |
| Driver Service | nội bộ | `50053` |
| Booking Service | nội bộ | `50054` |
| Trip Service | nội bộ | `50055` |
| Payment Service | nội bộ | `50056` |
| Notification Service | nội bộ | `50057` |
| PostgreSQL | `5432` | - |
| MongoDB | `27017` | - |
| Redis | `6379` | - |
| Kafka | `9092` | - |
| Mock Payment Provider | `4000` | - |

Các port infrastructure được publish để debug local. Port HTTP/gRPC của
microservice chỉ được dùng bên trong Compose network.

## 3. Khởi động toàn bộ hệ thống

Tại thư mục gốc repository:

```powershell
docker compose up -d --build
```

Sau lần build đầu tiên, nếu không đổi source hoặc Dockerfile:

```powershell
docker compose up -d
```

Kiểm tra trạng thái:

```powershell
docker compose ps
```

Các service ứng dụng cần ở trạng thái `running`:

```text
api-gateway
auth-service
customer-service
driver-service
booking-service
trip-service
payment-service
notification-service
```

Các job sau có thể ở trạng thái `Exited (0)`:

```text
postgres-init
auth-migrate
customer-migrate
driver-migrate
booking-migrate
payment-migrate
```

Đây là trạng thái thành công vì chúng chỉ tạo database/schema rồi kết thúc.

## 4. Health và readiness

```powershell
curl.exe http://localhost:3000/health
curl.exe http://localhost:3000/ready
curl.exe http://localhost:3000/health/services
```

Kết quả thành công:

```json
{"status":"UP"}
```

```json
{"status":"READY"}
```

`/health/services` phải trả `status` là `HEALTHY` và tất cả service là `UP`.
Nếu một dependency dừng, endpoint có thể trả HTTP `503` và `DEGRADED`.

## 5. Luồng tích hợp cần kiểm tra

1. Đăng ký/đăng nhập qua `/api/auth`.
2. Customer tạo booking qua `/api/bookings`.
3. Booking gọi Driver Service bằng gRPC để tìm Driver gần pickup point.
4. Driver accept booking; Booking gọi Trip Service bằng gRPC.
5. Trip chuyển trạng thái và tạo review `PENDING` khi hoàn tất.
6. Payment tính tiền theo tọa độ Trip, nhận webhook và hỗ trợ idempotency.
7. Booking/Payment phát Kafka event; Notification Consumer ghi notification
   cho Customer hoặc Driver liên quan.

Chi tiết request và kết quả mong đợi nằm trong [TEST_01_30.md](../../TEST_01_30.md).

## 6. Dữ liệu và dừng hệ thống

Compose dùng named volume:

```text
postgres_data
mongodb_data
```

Dừng nhưng giữ container và dữ liệu:

```powershell
docker compose stop
```

Dừng và xóa container nhưng giữ volume:

```powershell
docker compose down
```

Không dùng `docker compose down -v` nếu cần giữ dữ liệu trước đó.

## 7. Debug

```powershell
docker compose logs --tail=100 api-gateway
docker compose logs --tail=100 booking-service trip-service payment-service
docker compose logs --tail=100 notification-service kafka
```

Sau khi sửa source/Dockerfile, build lại image:

```powershell
docker compose build
docker compose up -d
```

## 8. Chạy service trực tiếp trên host

Đây chỉ là phương án debug thay thế, không phải cách chạy demo Compose. Khi
chạy `node server.js` trực tiếp, mỗi service cần `.env` và gRPC address
`localhost:<port>` tương ứng. Không chạy đồng thời cùng service có cùng port
đang chạy trong Docker.
