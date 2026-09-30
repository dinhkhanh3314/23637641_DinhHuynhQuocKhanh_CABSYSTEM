# CABSystem - Microservice Architecture

## 1. Tổng quan

CABSystem được thiết kế theo kiến trúc Microservices, gồm 7 Microservice tương ứng với các Bounded Context chính:

| Bounded Context | Microservice | Database |
|---|---|---|
| Identity & Access | Auth Service | PostgreSQL |
| Customer Management | Customer Service | PostgreSQL |
| Driver & Vehicle Management | Driver Service | PostgreSQL + Redis |
| Booking Management | Booking Service | PostgreSQL |
| Trip Management | Trip Service | MongoDB |
| Payment | Payment Service | PostgreSQL |
| Notification | Notification Service | MongoDB |

Kiến trúc giao tiếp:

- Client → API Gateway: REST/HTTPS
- API Gateway → Microservice: gRPC
- Microservice → Microservice: gRPC khi cần phản hồi trực tiếp
- Microservice → Kafka: phát Event
- Kafka → Microservice: nhận Event
- Microservice → Database: chỉ truy cập Database của chính Service đó

---

## 2. Kiến trúc tổng quan

```text
                         ┌──────────────────────┐
                         │        CLIENT        │
                         │ Customer / Driver /   │
                         │ Admin                │
                         └──────────┬───────────┘
                                    │
                              REST / HTTPS
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     API GATEWAY      │
                         └──────────┬───────────┘
                                    │
                                  gRPC
                                    │
          ┌─────────────────────────┼──────────────────────────┐
          │                         │                          │
          ▼                         ▼                          ▼
 ┌────────────────┐       ┌──────────────────┐       ┌────────────────────┐
 │  Auth Service  │       │ Customer Service │       │   Driver Service   │
 └───────┬────────┘       └────────┬─────────┘       └─────────┬──────────┘
         │                         │                           │
         ▼                         ▼                           ├── PostgreSQL
    PostgreSQL                PostgreSQL                       │
                                                             └── Redis
                                                                 │
                                                                 │ gRPC
                                                                 ▼
                                                        ┌──────────────────┐
                                                        │ Booking Service  │
                                                        └────────┬─────────┘
                                                                 │
                                                     BookingAccepted
                                                                 │
                                                               Kafka
                                                                 │
                                                                 ▼
                                                        ┌──────────────────┐
                                                        │  Trip Service    │
                                                        └────────┬─────────┘
                                                                 │
                                                          TripCompleted
                                                                 │
                                                               Kafka
                                                                 │
                                                    ┌────────────┴────────────┐
                                                    ▼                         ▼
                                           ┌────────────────┐       ┌────────────────────┐
                                           │ Payment Service│       │Notification Service│
                                           └───────┬────────┘       └─────────┬──────────┘
                                                   │                          │
                                              PostgreSQL                    MongoDB
```

---

# 3. API Gateway

API Gateway là điểm truy cập từ Client vào hệ thống.

### Trách nhiệm

- Routing Request
- Authentication
- Authorization
- Rate Limiting
- Request Forwarding
- Logging

### Không xử lý Business Logic

API Gateway không thực hiện:

- Driver Matching
- Tạo Booking
- Tạo Trip
- Xử lý Payment
- Rating

Các nghiệp vụ này thuộc Microservice tương ứng.

### Health Check

API Gateway cung cấp các endpoint:

```text
GET /health
GET /ready
GET /health/services
```

`/health/services` kiểm tra trạng thái của các Microservice trong hệ thống.

### Security tại Gateway

API Gateway thực hiện:

- JWT validation
- Role/permission check
- Request validation
- Rate limiting
- Routing

Client không gọi trực tiếp các Microservice.

---

# 4. Auth Service

### Bounded Context

`Identity & Access`

### Trách nhiệm

- Đăng ký Customer
- Đăng nhập Customer
- Đăng nhập Driver
- Đăng nhập Admin
- Authentication
- Authorization
- Quản lý Role
- Quản lý Permission
- JWT / Refresh Token

### Database

```text
PostgreSQL
```

### Dữ liệu chính

```text
User
Role
Permission
RefreshToken
```

---

# 5. Customer Service

### Bounded Context

`Customer Management`

### Trách nhiệm

- Quản lý thông tin Customer
- Quản lý Profile
- Cập nhật thông tin Customer
- Admin quản lý Customer

### Database

```text
PostgreSQL
```

### Dữ liệu chính

```text
Customer
CustomerProfile
```

Customer Service chỉ quản lý thông tin nghiệp vụ của Customer.

Thông tin xác thực như Password, Role và Token thuộc Auth Service.

---

# 6. Driver Service

### Bounded Context

`Driver & Vehicle Management`

### Trách nhiệm

- Quản lý Driver
- Quản lý Vehicle
- Liên kết Driver với Vehicle
- Quản lý trạng thái hoạt động của Driver
- Quản lý Location của Driver

### Database

```text
PostgreSQL
```

Lưu các dữ liệu nghiệp vụ:

```text
Driver
Vehicle
DriverApplication
DriverVehicle
DriverStatus
```

### Driver Registration & Approval

Driver đăng ký thông qua Driver Service. Hồ sơ được tạo ở trạng thái `PENDING` và Admin có thể duyệt hoặc từ chối.

```text
Driver
   ↓
DriverApplication = PENDING
   ↓
Admin
   ├── APPROVED
   └── REJECTED
```

### Redis

Redis được sử dụng cho dữ liệu cần truy cập nhanh:

```text
Driver Online / Offline
Driver Current Location
```

Ví dụ:

```text
Booking Service
      │
      │ gRPC
      ▼
Driver Service
      │
      ▼
Redis
      │
      ├── Driver Status
      └── Driver Location
```

---

# 7. Booking Service

### Bounded Context

`Booking Management`

### Trách nhiệm

- Tạo Booking
- Quản lý điểm đón
- Quản lý điểm đến
- Quản lý loại xe yêu cầu
- Theo dõi trạng thái Booking
- Hủy Booking
- Xem lịch sử Booking
- Tìm Driver phù hợp
- Gửi Booking cho Driver
- Xử lý Driver từ chối
- Xử lý Driver không phản hồi
- Tìm Driver thay thế
- Xử lý trường hợp không tìm được Driver

### Database

```text
PostgreSQL
```

### Pagination

Danh sách Booking của Customer hỗ trợ `limit` và `paging`.

```text
GET /bookings?limit=10&page=1
```

### Driver Offer

Sau khi tìm được Driver phù hợp, Booking Service tạo và quản lý Driver Offer.

```text
BookingDriverOffer
├── Booking
├── Driver
├── Status: PENDING / ACCEPTED / REJECTED / EXPIRED
├── SentAt
└── ExpiredAt
```

### Driver Matching

Driver Matching hiện được đặt trong Booking Service vì:

- Matching chỉ phục vụ quy trình Booking
- Logic Matching hiện chưa đủ phức tạp để tách thành Service riêng
- Giảm số lượng Microservice
- Giảm giao tiếp giữa các Service

Booking Service gọi Driver Service bằng gRPC để lấy thông tin cần thiết:

```text
Booking Service
      │
      │ gRPC
      ▼
Driver Service
      │
      ├── Driver Status
      ├── Driver Location
      └── Vehicle
      │
      ▼
Redis GEO
      │
      └── Drivers within 1km
```

Driver Service hỗ trợ tìm Driver theo tọa độ với bán kính, `limit` và `paging`.

---

# 8. Trip Service

### Bounded Context

`Trip Management`

### Trách nhiệm

- Tạo Trip
- Quản lý Trip
- Theo dõi Trip
- Cập nhật trạng thái Trip
- Hoàn thành Trip
- Hủy Trip
- Xem lịch sử Trip
- Customer Rating Driver

### Trip State

```text
ASSIGNED
   ↓
ARRIVING
   ↓
ARRIVED
   ↓
IN_PROGRESS
   ↓
COMPLETED
```

Trip có thể chuyển sang `CANCELED` khi chuyến bị hủy. Khi Customer hủy, hệ thống lưu `canceledBy`, `reason` và `canceledAt`.

### Database

```text
MongoDB
```

### Booking → Trip

Khi Driver chấp nhận Booking:

```text
Booking Service
      │
      │ Kafka
      ▼
BookingAccepted
      │
      ▼
Trip Service
      │
      ▼
Create Trip
```

### Trip → Payment

Khi Trip hoàn thành:

```text
Trip Service
      │
      │ Kafka
      ▼
TripCompleted
```

Event `TripCompleted` được Payment Service và Notification Service xử lý.

---

# 9. Payment Service

### Bounded Context

`Payment`

### Trách nhiệm

- Tạo Payment
- Xử lý thanh toán
- Hỗ trợ thanh toán tiền mặt
- Hỗ trợ thanh toán điện tử trong phạm vi hệ thống
- Theo dõi trạng thái Payment
- Xử lý Payment thất bại
- Cho phép thanh toán lại
- Lưu lịch sử Payment

### Idempotency

Payment API sử dụng `Idempotency-Key` để tránh xử lý cùng một transaction nhiều lần. Request được gửi lại với cùng key sẽ trả lại kết quả trước đó và không tạo thêm transaction.

```text
POST /payments
Idempotency-Key: abc123
```

### Database

```text
PostgreSQL
```

### Trip → Payment

```text
Trip Service
      │
      │ Kafka
      ▼
TripCompleted
      │
      ▼
Payment Service
      │
      ├── PaymentCompleted
      │
      └── PaymentFailed
```

Payment Service không lưu trực tiếp:

- Số thẻ
- CVV
- Mật khẩu ngân hàng
- Thông tin thanh toán nhạy cảm

### Payment Provider

Để đáp ứng flow thanh toán online và callback, Payment Service giao tiếp với một Payment Provider. Trong phạm vi project có thể sử dụng Mock Payment Provider để kiểm thử bằng Postman.

```text
Payment Service
      │
      ▼
Payment Provider
      │
      │ Callback
      ▼
Payment Service
      │
      ▼
PaymentCompleted / PaymentFailed
```

Payment Provider không được phép truy cập trực tiếp Database của Payment Service.

---

# 10. Notification Service

### Bounded Context

`Notification`

### Trách nhiệm

- Tạo Notification
- Quản lý Notification
- Xác định người nhận
- Theo dõi trạng thái Notification
- Lưu lịch sử Notification

### Database

```text
MongoDB
```

### Kafka Events

Notification Service nhận các Event như:

```text
BookingCreated
BookingAccepted
BookingCancelled
NoDriverAvailable
TripCreated
TripCompleted
PaymentCompleted
PaymentFailed
```

Ví dụ:

```text
Payment Service
      │
      │ Kafka
      ▼
PaymentCompleted
      │
      ▼
Notification Service
      │
      ▼
Thông báo Customer
```

---

# 11. Giao tiếp giữa các Microservice

## 11.1. REST/HTTPS

Client giao tiếp với API Gateway:

```text
Client
   │
   │ REST / HTTPS
   ▼
API Gateway
```

REST được sử dụng làm giao tiếp bên ngoài hệ thống.

---

## 11.2. gRPC

gRPC được sử dụng khi cần giao tiếp đồng bộ và nhận kết quả trực tiếp.

Ví dụ:

```text
API Gateway
      │
      │ gRPC
      ▼
Booking Service
```

Hoặc:

```text
Booking Service
      │
      │ gRPC
      ▼
Driver Service
```

Một số giao tiếp gRPC:

| From | To | Mục đích |
|---|---|---|
| API Gateway | Auth Service | Authentication |
| API Gateway | Customer Service | Customer |
| API Gateway | Driver Service | Driver / Vehicle |
| API Gateway | Booking Service | Booking |
| API Gateway | Trip Service | Trip / Rating |
| API Gateway | Payment Service | Payment |
| API Gateway | Notification Service | Notification |
| Booking Service | Driver Service | Driver Matching |

Chỉ tạo kết nối gRPC khi Service thực sự cần dữ liệu hoặc kết quả từ Service khác.

---

## 11.3. Kafka

Kafka được sử dụng cho giao tiếp bất đồng bộ thông qua Event.

### Booking Event

```text
Booking Service
      │
      │ Kafka
      ▼
BookingAccepted
      │
      ├──────────► Trip Service
      │
      └──────────► Notification Service
```

### Trip Event

```text
Trip Service
      │
      │ Kafka
      ▼
TripCompleted
      │
      ├──────────► Payment Service
      │
      └──────────► Notification Service
```

### Payment Event

```text
Payment Service
      │
      ├── PaymentCompleted
      │
      └── PaymentFailed
               │
               │ Kafka
               ▼
       Notification Service
```

---

# 12. Security Architecture

Các yêu cầu bảo mật chính của project:

```text
Client
   │
   ▼
API Gateway
   ├── JWT Validation
   ├── Authorization
   ├── Rate Limiting
   └── Request Validation
   │
   ▼
Microservices
```

Các API phải xử lý được các smoke test về:

- Data encryption at rest
- SQL Injection
- XSS input
- JWT tampering
- Unauthorized API access
- Rate limiting
- Replay attack / Idempotency

Sensitive data phải được mã hóa khi lưu trữ và secret/key không được commit vào GitHub.

---

# 13. Database Architecture

Mỗi Microservice sở hữu Database riêng.

```text
Auth Service
    └── PostgreSQL

Customer Service
    └── PostgreSQL

Driver Service
    ├── PostgreSQL
    └── Redis

Booking Service
    └── PostgreSQL

Trip Service
    └── MongoDB

Payment Service
    └── PostgreSQL

Notification Service
    └── MongoDB
```

Không cho phép Service truy cập trực tiếp Database của Service khác.

Không sử dụng:

```text
Booking Service → Driver Database
Trip Service → Payment Database
Payment Service → Trip Database
```

Thay vào đó:

```text
Service → gRPC → Service
```

hoặc:

```text
Service → Kafka → Event → Service
```

---

# 14. Quy trình nghiệp vụ chính

Quy trình nghiệp vụ chính của CABSystem:

```text
Customer
   │
   │ REST / HTTPS
   ▼
API Gateway
   │
   │ gRPC
   ▼
Auth Service
   │
   ▼
Đăng nhập thành công
   │
   ▼
Booking Service
   │
   │ gRPC
   ▼
Driver Service
   │
   ▼
Tìm Driver phù hợp
   │
   ▼
Gửi Booking cho Driver
   │
   ├── Driver từ chối
   │       │
   │       ▼
   │   Tìm Driver khác
   │
   └── Driver chấp nhận
           │
           │ Kafka
           ▼
      BookingAccepted
           │
           ▼
      Trip Service
           │
           ▼
      Thực hiện Trip
           │
           ▼
      Hoàn thành Trip
           │
           │ Kafka
           ▼
      TripCompleted
           │
           ├──────────────► Payment Service
           │                     │
           │                     │ PaymentCompleted
           │                     │ PaymentFailed
           │                     ▼
           │               Notification Service
           │
           └──────────────► Notification Service

           Sau khi Trip hoàn thành
                    │
                    ▼
                  Rating
                    │
                    ▼
              Trip Service
```

---

# 15. Nguyên tắc lựa chọn Communication

```text
Cần phản hồi ngay từ Service khác?
              │
             YES
              │
              ▼
            gRPC


Chỉ cần thông báo rằng một Event đã xảy ra?
              │
             YES
              │
              ▼
            Kafka
```

Không sử dụng Kafka cho mọi giao tiếp.

Không sử dụng gRPC để kết nối tất cả Service với nhau.

Chỉ tạo Service-to-Service communication khi có yêu cầu nghiệp vụ hoặc dữ liệu thực sự cần thiết.

---

# 16. Phạm vi kiến trúc

Kiến trúc hiện tại tập trung vào các nghiệp vụ chính:

```text
Account
   ↓
Booking
   ↓
Driver Matching
   ↓
Trip
   ↓
Payment
   ↓
Rating
```

Các thành phần không thuộc kiến trúc hiện tại:

- External Map Service
- External Notification Provider
- Accounting System
- Driver Salary/Commission
- Vehicle Maintenance
- Recruitment/Training
- Loyalty/Promotion
- Advanced Analytics

---

# 17. Cấu trúc thư mục dự kiến

```text
CABSystem/
│
├── services/
│   ├── auth-service/
│   ├── customer-service/
│   ├── driver-service/
│   ├── booking-service/
│   ├── trip-service/
│   ├── payment-service/
│   └── notification-service/
│
├── api/
│   └── openapi.yaml
│
├── docs/
│   ├── requirements/
│   ├── diagrams/
│   └── testing/
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

Mỗi Microservice có cấu trúc cơ bản:

```text
service/
│
├── src/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── config/
│   └── app.js
│
├── tests/
├── .env
├── Dockerfile
└── package.json
```
