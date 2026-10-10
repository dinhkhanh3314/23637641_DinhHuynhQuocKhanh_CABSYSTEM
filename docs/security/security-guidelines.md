## Security

## Cơ chế hiện có

- API Gateway xác thực JWT từ header `Authorization: Bearer <token>`.
- Token sai, token hết hạn hoặc token bị sửa chữ ký trả HTTP `401`.
- Thiếu `JWT_SECRET` là lỗi cấu hình, không tự chạy ở chế độ không bảo vệ.
- Các nhóm Customer, Driver, Booking, Trip, Payment và Notification yêu cầu
  JWT.
- Route health, route gốc và route Auth/OTP công khai theo thiết kế.
- Rate limit được áp dụng trước nhóm route `/api`.
- Approve/reject Driver application yêu cầu `OPERATOR` hoặc `ADMIN`.
- Customer, Driver, Booking và Trip kiểm tra ownership/role trước khi truy cập.
- Payment lấy Customer từ JWT, không tin `customerId` do client gửi.
- Rating lấy reviewer từ JWT, không tin `reviewerId` do client gửi.
- Payment hỗ trợ `Idempotency-Key` để retry không tạo giao dịch mới.
- Webhook Payment có thể yêu cầu `X-Payment-Webhook-Secret`.
- Password có độ dài tối thiểu 8 ký tự.
- OTP không trả trong response khi `NODE_ENV=production`.

## Route công khai

```text
GET  /health
GET  /ready
GET  /health/services
GET  /api/
POST /api/auth/register
POST /api/auth/login
POST /api/auth/driver/send-otp
POST /api/auth/driver/verify-otp
POST /api/auth/driver/register
POST /api/auth/driver/set-password
```

## Route yêu cầu JWT

```text
/api/customers
/api/drivers
/api/bookings
/api/trips
/api/payments
/api/notifications
```

Ví dụ:

```http
Authorization: Bearer <access_token>
```

## Các kiểm thử bảo mật cần chạy

1. Gọi `/api/bookings` không có token → `401`.
2. Gọi bằng token sai → `401`.
3. Sửa payload JWT nhưng không ký lại → `401`.
4. Customer gọi accept booking hoặc approve application → `403`.
5. Gửi password ngắn hơn 8 ký tự → `400`.
6. Gửi SQL injection trong login → không đăng nhập, không lộ dữ liệu.
7. Gửi chuỗi XSS trong comment → API không thực thi script; frontend phải
   escape khi hiển thị.
8. Gửi nhiều request liên tục → đạt ngưỡng thì `429`.
9. Gửi lại Payment với cùng `Idempotency-Key` → trả payment cũ, không double
   charge.
10. Gửi webhook sai secret → bị từ chối.

## Encryption và giới hạn

Password phải được hash, không lưu plaintext. Tuy nhiên hash password không
đồng nghĩa với encryption at rest cho toàn bộ PostgreSQL/MongoDB volume.
Encryption at rest của database/volume và key management phải được bật ở hạ
tầng triển khai nếu tiêu chí chấm yêu cầu.

JWT hiện được xác thực tại Gateway. Nếu cần defense-in-depth, có thể truyền
identity đã xác thực qua gRPC metadata và xác thực lại ở từng service.
