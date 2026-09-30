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
- Xác thực JWT cục bộ bằng public key (chỉ gọi Auth Service khi login/refresh, không gọi cho mỗi request)
- Định tuyến `/users/me` theo vai trò (Customer → Customer Service, Driver → Driver Service)

### Không xử lý Business Logic

API Gateway không thực hiện:

- Driver Matching
- Tạo Booking
- Tạo Trip
- Xử lý Payment
- Rating

Các nghiệp vụ này thuộc Microservice tương ứng.

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
- Phát `UserRegistered` sau khi đăng ký Customer
- Nhận `AccountStatusChanged` để khóa/mở khóa tài khoản và thu hồi Refresh Token (đăng nhập trả `ACCOUNT_LOCKED`)

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
- Nhận `UserRegistered` để tạo CustomerProfile
- Admin khóa/mở khóa Customer, phát `AccountStatusChanged`

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
- Nhận `BookingAccepted` → Driver `BUSY`; nhận `TripCompleted` → Driver `ONLINE` (BRL-26)
- Nhận `DriverRated` → cập nhật `averageRating` (BRL-28)
- Admin khóa/mở khóa Driver, phát `AccountStatusChanged`; Driver bị khóa không được Matching chọn (BRL-30)

### Database

```text
PostgreSQL
```

Lưu các dữ liệu nghiệp vụ:

```text
Driver
Vehicle
DriverVehicle
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
- Tính `estimatedFare` khi tạo Booking (BRL-25)
- Quản lý BookingOffer và timeout (BRL-10, BRL-27)
- Phát `BookingCreated`, `BookingOfferCreated`, `BookingAccepted`, `BookingCancelled`, `NoDriverAvailable`
- Nhận `TripCreated` để cập nhật `tripId` của Booking

### Database

```text
PostgreSQL
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
```

### Booking Offer, Timeout và Nhất quán

- **BookingOffer:** `offerId`, `bookingId`, `driverId`, `status` (PENDING / ACCEPTED / REJECTED / EXPIRED), `expiresAt`. Lưu trong PostgreSQL của Booking Service.
- **Timeout (BRL-10):** scheduler trong Booking Service quét offer PENDING quá `expiresAt`, chuyển EXPIRED rồi tìm Driver thay thế. Thời hạn là cấu hình.
- **Driver nhận offer:** `GET /drivers/me/booking-offers` (polling) và thông báo `BOOKING_OFFER_CREATED`.
- **Accept và Cancel đồng thời (BRL-29):** Booking có cột `version` (optimistic lock). Accept chỉ thành công khi `status = SENT_TO_DRIVER`; Cancel chỉ thành công khi `PENDING_DRIVER` hoặc `SENT_TO_DRIVER`. Bên thua nhận `409`.
- **Outbox:** thay đổi trạng thái Booking và bản ghi event `BookingAccepted` được ghi cùng một transaction vào bảng outbox, relay publish lên Kafka. Tránh trường hợp Booking đã `ACCEPTED` mà không có Trip.
- **Accept là bất đồng bộ:** `POST /booking-offers/{id}/accept` trả `{bookingId, status, tripId: null}`. Trip Service tạo Trip rồi phát `TripCreated`, Booking Service ghi `tripId`.

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
- Xem lịch sử Trip
- Customer Rating Driver
- Nhận `BookingAccepted` để tạo Trip (idempotent theo `bookingId`), phát `TripCreated`
- Lấy `fare` từ `estimatedFare` trong `BookingAccepted` (BRL-25)
- Phát `TripCompleted`, `DriverRated`
- Nhận `PaymentCreated` để ghi `paymentId` vào Trip
- Payment thất bại không làm đổi trạng thái Trip (NFR-13)

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

Thanh toán điện tử được Payment Service xử lý nội bộ ở mức mô phỏng. Không tích hợp Payment Provider bên ngoài, không có webhook.

Payment Service nhận `TripCompleted`, tạo Payment (`amount` = `fare` trong event, unique theo `tripId` để idempotent) rồi phát `PaymentCreated`. Kết quả thanh toán phát qua `PaymentCompleted` / `PaymentFailed`.

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
- Cung cấp API xem thông báo và đánh dấu đã đọc (`GET /notifications`, `POST /notifications/{id}/read`)
- Thông báo là thông báo trong hệ thống, không dùng Notification Provider bên ngoài

### Database

```text
MongoDB
```

### Kafka Events

Notification Service nhận các Event như:

```text
BookingCreated
BookingOfferCreated
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

## 11.4. Event Catalog

| Event | Producer | Consumer | Payload chính | Mục đích |
|---|---|---|---|---|
| `UserRegistered` | Auth | Customer | userId, fullName, phone, email | Tạo CustomerProfile |
| `AccountStatusChanged` | Customer, Driver | Auth | userId, status, reason | Khóa/mở khóa tài khoản |
| `BookingCreated` | Booking | Notification | bookingId, customerId | Thông báo |
| `BookingOfferCreated` | Booking | Notification | offerId, driverId, expiresAt | Thông báo Driver |
| `BookingAccepted` | Booking | Trip, Driver, Notification | bookingId, customerId, driverId, vehicleId, pickup, dropoff, estimatedFare | Tạo Trip, Driver BUSY |
| `BookingCancelled` | Booking | Notification | bookingId | Thông báo |
| `NoDriverAvailable` | Booking | Notification | bookingId, customerId | Thông báo (FR-12) |
| `TripCreated` | Trip | Booking, Notification | tripId, bookingId | Ghi `tripId` cho Booking |
| `TripCompleted` | Trip | Payment, Driver, Notification | tripId, customerId, driverId, fare | Tạo Payment, Driver ONLINE |
| `PaymentCreated` | Payment | Trip | paymentId, tripId | Ghi `paymentId` cho Trip |
| `PaymentCompleted` | Payment | Notification | paymentId, tripId | Thông báo |
| `PaymentFailed` | Payment | Notification | paymentId, tripId, failureReason | Thông báo (không đổi Trip) |
| `DriverRated` | Trip | Driver | driverId, tripId, score | Cập nhật `averageRating` |

## 11.5. Độ tin cậy của Event

- Producer dùng **Outbox pattern**: ghi dữ liệu nghiệp vụ và event trong cùng transaction, relay publish lên Kafka (NFR-11, NFR-19, NFR-21).
- Consumer xử lý **idempotent**: lưu `eventId` đã xử lý hoặc dùng unique key nghiệp vụ (ví dụ Trip unique theo `bookingId`, Payment unique theo `tripId`).
- Event gắn `eventId`, `occurredAt`, `aggregateId` và key Kafka theo `aggregateId` để giữ thứ tự theo từng Booking/Trip.

---

# 12. Database Architecture

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

# 13. Quy trình nghiệp vụ chính

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

# 14. Nguyên tắc lựa chọn Communication

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

# 15. Phạm vi kiến trúc

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
- External Payment Provider
- External Notification Provider
- Accounting System
- Driver Salary/Commission
- Vehicle Maintenance
- Recruitment/Training
- Loyalty/Promotion
- Advanced Analytics

---

# 16. Cấu trúc thư mục dự kiến

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

---

# 17. Đồng bộ với API và Requirements

## 17.1. openapi.yaml → Microservice

Mỗi operation trong `openapi.yaml` có `x-service`.

| Nhóm API | Service |
|---|---|
| `/auth/*` | Auth Service |
| `/users/me` | Customer Service (CUSTOMER) / Driver Service (DRIVER) |
| `/bookings*`, `/booking-offers/*`, `/drivers/me/booking-offers`, `/admin/bookings` | Booking Service |
| `/drivers/me/status`, `/drivers/me/vehicles*`, `/admin/drivers*`, `/admin/vehicles*` | Driver Service |
| `/admin/customers*` | Customer Service |
| `/trips*` (kể cả `/rating`), `/admin/trips` | Trip Service |
| `/trips/{id}/payment`, `/payments/*` | Payment Service |
| `/notifications*` | Notification Service |

## 17.2. Quyết định thiết kế

- Không có Payment Provider và Notification Provider bên ngoài; các requirements đã được sửa theo.
- Accept Booking là bất đồng bộ; Trip và Payment xuất hiện sau khi event được xử lý.
- Giữ MongoDB cho Trip theo thiết kế hiện tại. Lý do cần ghi rõ khi bảo vệ: dữ liệu Trip dạng document, dễ mở rộng trường theo dõi. Trip vẫn phải có state machine chặt (BRL-15, BRL-16).
- Access token ngắn hạn; khóa tài khoản có hiệu lực hoàn toàn sau khi token hết hạn, Refresh Token bị thu hồi ngay.

## 17.3. Vấn đề còn mở

- Ai tạo tài khoản Driver và Admin (requirements chỉ có đăng ký Customer). Đề xuất: Admin tạo Driver qua Driver Service, Driver Service yêu cầu Auth Service tạo User; cần stakeholder xác nhận.
- Thời hạn phản hồi offer và số lần tìm Driver thay thế tối đa.
- Công thức tính `estimatedFare` (ngoài phạm vi bản đồ nâng cao, cần công thức đơn giản theo loại xe).
- Trạng thái `NO_DRIVER_FOUND` của Booking cần stakeholder xác nhận.
