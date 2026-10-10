# Phần 14 - Security

## Đã triển khai

- API Gateway xác thực JWT từ header `Authorization: Bearer <token>`.
- Token sai hoặc hết hạn trả HTTP `401`.
- Thiếu `JWT_SECRET` trả lỗi cấu hình rõ ràng thay vì chạy không bảo vệ.
- Các nhóm API Customer, Driver, Booking, Trip, Payment và Notification yêu cầu
  JWT.
- Route health và các route Auth công khai vẫn có thể truy cập để đăng ký,
  đăng nhập và xác thực OTP.
- Rate limit được mount trước các route `/api`, nên thực sự áp dụng cho Gateway.
- Các route approve/reject Driver application yêu cầu role `OPERATOR` hoặc
  `ADMIN`.
- Route resubmit application yêu cầu role `DRIVER`.
- Password đăng ký/đặt mật khẩu tối thiểu 8 ký tự.
- OTP không được trả trong response khi `NODE_ENV=production`.

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

Gửi token trong Postman:

```http
Authorization: Bearer <accessToken>
```

## Kiểm tra thủ công bằng Postman

1. Gọi API nghiệp vụ không có header Authorization và xác nhận HTTP `401`.
2. Gọi bằng token sai và xác nhận HTTP `401`.
3. Đăng nhập để lấy `accessToken`.
4. Gọi lại API bằng token hợp lệ và xác nhận request đi tiếp.
5. Dùng token Customer gọi route approve application và xác nhận HTTP `403`.
6. Kiểm tra đăng ký/đặt password ngắn hơn 8 ký tự trả HTTP `400`.
7. Đặt `NODE_ENV=production`, gửi OTP và xác nhận response không chứa OTP.

## Giới hạn cần kiểm tra tiếp

JWT hiện được xác thực tại Gateway; thông tin identity chưa được truyền vào
metadata gRPC để microservice tự xác thực. Kiểm tra ownership của từng
`customerId`, `driverId`, `bookingId` và `tripId` là bước hardening/integration
tiếp theo nếu cần bảo vệ ở mức service.
