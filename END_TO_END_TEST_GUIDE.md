# CAB System - Huong dan test tu dau den cuoi

Tai lieu nay huong dan test thu cong toan bo CAB System bang Postman. Tat ca
request, ke ca health check, deu duoc gui thu cong trong Postman. Hay thuc hien
theo dung thu tu. Khi gap loi, dung lai o buoc dang loi va ghi lai log, URL,
method, body, status HTTP va cac ID da nhan duoc.

## 1. Kien truc can xac nhan

```text
Client/Postman
    -> HTTP/REST API Gateway :3000
    -> gRPC
    -> Microservice
    -> PostgreSQL/MongoDB/Redis
    -> Kafka event
    -> Notification Consumer
```

Khong dung truc tiep HTTP cua microservice trong bai test chinh. Cac request
nghiep vu phai di qua:

```text
http://localhost:3000/api
```

## 2. Cac cong can biet

| Thanh phan | HTTP | gRPC |
|---|---:|---:|
| API Gateway | 3000 | - |
| Auth Service | 3001 | 50051 |
| Customer Service | 3002 | 50052 |
| Driver Service | 3003 | 50053 |
| Booking Service | 3004 | 50054 |
| Trip Service | 3005 | 50055 |
| Payment Service | 3006 | 50056 |
| Notification Service | 3007 | 50057 |
| PostgreSQL | 5432 | - |
| MongoDB | 27017 | - |
| Redis | 6379 | - |
| Kafka | 9092 | - |
| Mock Payment Provider | 4000 | - |

## 3. Kiem tra truoc khi chay

Can cai dat:

- Docker Desktop dang chay.
- Node.js va npm.
- Postman.
- Git khong bat buoc cho viec test.

Mo PowerShell tai thu muc goc:

```powershell
cd "E:\IS_IUH\26-27 HK1\MSA\Project\23637641_DinhHuynhQuocKhanh_capsystem"
```

Khong thay doi cac gia tri dang chay trong `.env`. Kiem tra cac file sau co
ton tai:

```text
.env
services\auth-service\.env
services\customer-service\.env
services\driver-service\.env
services\booking-service\.env
services\trip-service\.env
services\payment-service\.env
services\notification-service\.env
```

Ba service su dung Kafka can co:

```env
KAFKA_BROKERS=localhost:9092
```

Trong:

```text
services\booking-service\.env
services\payment-service\.env
services\notification-service\.env
```

Notification Service can them:

```env
KAFKA_GROUP_ID=notification-service
```

## 4. Khoi dong infrastructure

Tu thu muc goc chay:

```powershell
docker compose up -d postgres mongodb redis kafka mock-payment-provider
```

Kiem tra container:

```powershell
docker ps
```

Can thay:

```text
cabsystem-postgres
cabsystem-mongodb
cabsystem-redis
cabsystem-kafka
cabsystem-mock-payment-provider
```

Neu can xem log:

```powershell
docker logs cabsystem-kafka
docker logs cabsystem-postgres
docker logs cabsystem-mongodb
docker logs cabsystem-mock-payment-provider
```

## 5. Khoi dong cac service

Mo mot terminal rieng cho tung service. Luon `cd` vao dung thu muc service
truoc khi chay `node server.js` de `dotenv` doc dung `.env`.

### Terminal 1 - Notification

```powershell
cd "E:\IS_IUH\26-27 HK1\MSA\Project\23637641_DinhHuynhQuocKhanh_capsystem\services\notification-service"
node server.js
```

Can thay:

```text
Notification Service running on port 3007
Notification gRPC Server running on port 50057
Notification Kafka consumer is running
```

### Terminal 2 - Customer

```powershell
cd "E:\IS_IUH\26-27 HK1\MSA\Project\23637641_DinhHuynhQuocKhanh_capsystem\services\customer-service"
node server.js
```

### Terminal 3 - Driver

```powershell
cd "E:\IS_IUH\26-27 HK1\MSA\Project\23637641_DinhHuynhQuocKhanh_capsystem\services\driver-service"
node server.js
```

### Terminal 4 - Auth

```powershell
cd "E:\IS_IUH\26-27 HK1\MSA\Project\23637641_DinhHuynhQuocKhanh_capsystem\services\auth-service"
node server.js
```

### Terminal 5 - Trip

```powershell
cd "E:\IS_IUH\26-27 HK1\MSA\Project\23637641_DinhHuynhQuocKhanh_capsystem\services\trip-service"
node server.js
```

### Terminal 6 - Booking

```powershell
cd "E:\IS_IUH\26-27 HK1\MSA\Project\23637641_DinhHuynhQuocKhanh_capsystem\services\booking-service"
node server.js
```

### Terminal 7 - Payment

```powershell
cd "E:\IS_IUH\26-27 HK1\MSA\Project\23637641_DinhHuynhQuocKhanh_capsystem\services\payment-service"
node server.js
```

### Terminal 8 - API Gateway

```powershell
cd "E:\IS_IUH\26-27 HK1\MSA\Project\23637641_DinhHuynhQuocKhanh_capsystem\services\api-gateway"
node server.js
```

Can thay:

```text
API Gateway running on port 3000
```

## 6. Kiem tra health bang Postman

### 6.1. Health cua API Gateway

Gui ba request sau qua API Gateway:

```http
GET http://localhost:3000/health
GET http://localhost:3000/ready
GET http://localhost:3000/health/services
```

Khi tat ca service dang chay, ket qua mong doi:

- `/health`: HTTP `200`, response co `"status": "UP"`.
- `/ready`: HTTP `200`, response co `"status": "READY"`.
- `/health/services`: HTTP `200`, response co `"status": "HEALTHY"` va moi
  service co trang thai `"UP"`.

Vi du response cua `/health/services`:

```json
{
  "status": "HEALTHY",
  "gateway": "UP",
  "authService": "UP",
  "customerService": "UP",
  "driverService": "UP",
  "bookingService": "UP",
  "tripService": "UP",
  "paymentService": "UP",
  "notificationService": "UP"
}
```

Gateway goi `GET /health` cua tung service de tao danh sach nay. Neu co
service khong phan hoi, `/health/services` tra HTTP `503`, `"status":
"DEGRADED"` va service do co trang thai `"DOWN"`. Khi do, kiem tra terminal
cua service tuong ung truoc khi tiep tuc.

### 6.2. Health truc tiep cua tung service

Tao va gui lan luot cac request `GET` sau trong Postman:

```http
GET http://localhost:3000/health
GET http://localhost:3001/health
GET http://localhost:3002/health
GET http://localhost:3003/health
GET http://localhost:3004/health
GET http://localhost:3005/health
GET http://localhost:3006/health
GET http://localhost:3007/health
```

Tat ca request can tra HTTP `200`. Noi dung response co the khac nhau tuy
service, nhung phai cho thay service dang `UP` hoac `OK`.

Neu request nao khong ket noi duoc, kiem tra terminal cua service tuong ung va
khong tiep tuc luong nghiep vu cho den khi health request do tra thanh cong.

## 6.1. Kiem tra Security co ban

Truoc khi test nghiep vu, xac nhan Gateway dang bao ve cac route:

```http
GET {{base_url}}/api/bookings
```

Khong gui header `Authorization`. Ket qua mong doi:

```text
HTTP 401
```

Gui lai request voi header sai:

```http
Authorization: Bearer invalid-token
```

Ket qua van phai la HTTP `401`.

Khong ap dung hai kiem tra nay cho `/health`, `/ready` va cac route
`/api/auth/*`.

## 7. Quy uoc luu ID

Trong Postman tao mot environment voi:

```text
base_url = http://localhost:3000
customer_id =
driver_id =
application_id =
booking_id =
trip_id =
payment_id =
notification_id =
```

Sau moi response thanh cong, luu ID vao environment. Khong tu do dien ID neu
ID do chua ton tai trong database.

Sau khi login, luu `accessToken` vao bien:

```text
access_token =
```

Voi cac request toi `/api/customers`, `/api/drivers`, `/api/bookings`,
`/api/trips`, `/api/payments` va `/api/notifications`, them header:

```http
Authorization: Bearer {{access_token}}
```

Neu bo header nay, Gateway se tra HTTP `401`. Cac route `/health`, `/ready`,
`/api/auth/*` va `GET /api/` la route cong khai.

## 8. Test Auth va Customer

Tat ca request duoi day gui qua `{{base_url}}`.

### 8.1 Dang ky Customer

```http
POST {{base_url}}/api/auth/register
Content-Type: application/json
```

Body can theo schema dang ky hien tai trong Auth Service, vi du:

```json
{
  "phone": "0900000001",
  "email": "customer-test-001@example.com",
  "password": "Password123",
  "role": "CUSTOMER",
  "fullName": "Customer Test"
}
```

Luu `userId` hoac `customerId` tu response. Neu schema response khac, dung dung
ten truong ma response tra ve.

### 8.2 Dang nhap Customer

```http
POST {{base_url}}/api/auth/login
Content-Type: application/json
```

Luu token tu response login. Gateway su dung token nay de xac thuc cac request
nghiep vu phia sau.

Voi code hien tai, response login tra ve `accessToken`. Luu gia tri nay vao
`access_token` va dung header Bearer cho cac buoc nghiep vu phia sau.

### 8.3 Kiem tra token het han

Khong can cho token hien tai het han trong lan test dau tien. Co the kiem tra
bang token het han da tao rieng trong moi truong test hoac bo qua case nay neu
khong co cach tao token het han. Khi Gateway nhan token het han, ket qua phai
la HTTP `401` voi message `Token expired`.

### 8.3 Doc va cap nhat Customer

```http
GET {{base_url}}/api/customers/{{customer_id}}
PUT {{base_url}}/api/customers/{{customer_id}}
```

Body cap nhat phai dung schema hien tai cua Customer Service. Ket qua can dung
`customer_id` da luu, khong tao ID moi.

## 9. Test Driver: OTP, dang ky va duyet ho so

### 9.1 Gui OTP

```http
POST {{base_url}}/api/auth/driver/send-otp
Content-Type: application/json
```

Body mau:

```json
{
  "phone": "0900000002"
}
```

Lay OTP tu response hoac log Auth Service theo cach code hien tai dang cung
cap. Khong dung OTP cu.

### 9.2 Xac thuc OTP

```http
POST {{base_url}}/api/auth/driver/verify-otp
Content-Type: application/json
```

Body mau:

```json
{
  "phone": "0900000002",
  "otp": "<otp-thuc-te>"
}
```

### 9.3 Dang ky Driver

```http
POST {{base_url}}/api/auth/driver/register
Content-Type: application/json
```

Gui day du cac truong ma Auth Service yeu cau, vi du:

```json
{
  "phone": "0900000002",
  "email": "driver-test-001@example.com",
  "fullName": "Driver Test",
  "licenseNo": "B2-TEST-001",
  "vehicleType": "CAR",
  "plateNumber": "51A-00001",
  "brand": "Toyota",
  "model": "Vios",
  "color": "White"
}
```

Luu `driverId`, `userId` va `applicationId` neu response tra ve.

### 9.4 Xem application

```http
GET {{base_url}}/api/drivers/applications
GET {{base_url}}/api/drivers/applications/{{application_id}}
```

Application moi dang ky can co trang thai:

```text
PENDING
```

### 9.5 Duyet application

```http
PUT {{base_url}}/api/drivers/applications/{{application_id}}/approve
```

Ket qua mong doi: application chuyen sang `APPROVED`.

Kiem tra thu Driver chua duyet online se bi tu choi. Sau khi duyet, goi:

```http
POST {{base_url}}/api/auth/driver/set-password
Content-Type: application/json
```

Body dung cac truong Auth Service yeu cau, gom phone va password moi.

### 9.5.1 Kiem tra phan quyen application

Dung token Customer da luu, goi:

```http
PUT {{base_url}}/api/drivers/applications/{{application_id}}/approve
Authorization: Bearer {{access_token}}
```

Ket qua mong doi la HTTP `403`. Khong dung token Customer de duyet ho so.

Sau do dung token co role `OPERATOR` hoac `ADMIN` neu project da co tai khoan
role nay de goi lai request approve. Ket qua mong doi la application chuyen
sang `APPROVED`.

### 9.6 Driver login, online va location

Dang nhap Driver qua:

```http
POST {{base_url}}/api/auth/login
```

Sau do:

```http
PUT {{base_url}}/api/drivers/{{driver_id}}/online
PUT {{base_url}}/api/drivers/{{driver_id}}/location
GET {{base_url}}/api/drivers/{{driver_id}}/location
GET {{base_url}}/api/drivers/online
GET {{base_url}}/api/drivers/nearby?latitude=10.7769&longitude=106.7009&radius=1000
```

Body cap nhat location mau:

```json
{
  "latitude": 10.7769,
  "longitude": 106.7009
}
```

Driver phai online va co location gan pickup point thi Booking moi co the tim
thay driver.

## 10. Test Booking

### 10.1 Tao booking

```http
POST {{base_url}}/api/bookings
Content-Type: application/json
```

Body:

```json
{
  "customerId": {{customer_id}},
  "pickupLatitude": 10.7769,
  "pickupLongitude": 106.7009,
  "destinationLatitude": 10.8231,
  "destinationLongitude": 106.6297,
  "vehicleType": "CAR"
}
```

Luu `booking_id`. Kiem tra:

- Booking co duoc tao.
- `customerId` dung customer da test.
- `driverId` la driver gan dung, hoac `0/null` va status `NO_DRIVER`.
- Booking Service log viec goi Driver gRPC.
- Notification Service log:

```text
Notification created from booking.events/BookingCreated
```

### 10.2 Xem booking

```http
GET {{base_url}}/api/bookings/{{booking_id}}
GET {{base_url}}/api/bookings
```

### 10.3 Driver accept

Chi goi khi booking dang `DRIVER_ASSIGNED`:

```http
PUT {{base_url}}/api/bookings/{{booking_id}}/accept
```

Kiem tra:

- Booking chuyen `DRIVER_ACCEPTED`.
- Booking Service goi Trip Service bang gRPC.
- Trip moi duoc tao.
- Notification Service nhan `DriverAccepted`.

### 10.4 Driver reject

Voi mot booking dang `DRIVER_ASSIGNED`, goi:

```http
PUT {{base_url}}/api/bookings/{{booking_id}}/reject
```

Kiem tra Booking tim driver tiep theo hoac chuyen `NO_DRIVER`, va log co
`DriverRejected`.

## 11. Test Trip

Neu accept booking da tu dong tao Trip, dung `tripId` trong response/log de
luu `trip_id`. Neu can tao truc tiep de test, request:

```http
POST {{base_url}}/api/trips
Content-Type: application/json
```

Body phai dung schema hien tai cua Trip Service va dung cac ID da ton tai:

```json
{
  "bookingId": {{booking_id}},
  "customerId": {{customer_id}},
  "driverId": {{driver_id}},
  "pickupLatitude": 10.7769,
  "pickupLongitude": 106.7009,
  "destinationLatitude": 10.8231,
  "destinationLongitude": 106.6297
}
```

Xem trip:

```http
GET {{base_url}}/api/trips/{{trip_id}}
```

Cap nhat trang thai theo cac trang thai ma Trip Service cho phep:

```http
PUT {{base_url}}/api/trips/{{trip_id}}/status
Content-Type: application/json
```

Body:

```json
{
  "status": "IN_PROGRESS"
}
```

Sau do co the chuyen sang trang thai hoan thanh theo business rule hien tai.

## 12. Test Payment

### 12.1 Tao payment

```http
POST {{base_url}}/api/payments
Content-Type: application/json
```

Body:

```json
{
  "tripId": {{trip_id}},
  "customerId": {{customer_id}},
  "amount": 100000,
  "paymentMethod": "CASH"
}
```

Luu `payment_id`. Trang thai ban dau mong doi:

```text
PENDING
```

Kiem tra Notification Service nhan:

```text
PaymentCreated
```

### 12.2 Xu ly payment

```http
PUT {{base_url}}/api/payments/{{payment_id}}/process
```

Payment Service goi Mock Payment Provider tai `http://localhost:4000`, cap
nhat payment thanh `PAID` hoac `FAILED`, sau do phat `PaymentProcessed`.

Kiem tra log:

```text
Notification created from payment.events/PaymentProcessed
```

## 13. Test Notification va Kafka

Lay notification cua customer:

```http
GET {{base_url}}/api/notifications/recipient/{{customer_id}}
```

Can thay cac notification tuong ung:

```text
BookingCreated
DriverAccepted hoac DriverRejected
PaymentCreated
PaymentProcessed
```

Doc mot notification:

```http
GET {{base_url}}/api/notifications/{{notification_id}}
```

Danh dau da doc:

```http
PUT {{base_url}}/api/notifications/{{notification_id}}/read
```

Kiem tra status chuyen tu `UNREAD` sang `READ`.

## 14. Kiem tra loi bat buoc

Thuc hien sau khi luong thanh cong da chay.

| Truong hop | Ket qua mong doi |
|---|---|
| Tao booking thieu truong | HTTP 400 |
| Lay booking khong ton tai | HTTP 404 |
| Tao payment voi trip ID khong hop le | HTTP 400 |
| Tao payment trung trip | HTTP 409 |
| Accept booking khong o `DRIVER_ASSIGNED` | HTTP 400 |
| Driver chua duyet go online | HTTP 400 hoac 412 |
| Service gRPC dich dung | HTTP 503 |
| Payment provider khong chay | Payment `FAILED`, co log loi |
| Kafka khong chay | Nghiep vu co the ghi DB, co log `Kafka publish failed` |
| Khong co JWT khi goi API nghiep vu | HTTP 401 |
| JWT sai | HTTP 401 |
| Customer approve Driver application | HTTP 403 |
| Password ngan hon 8 ky tu | HTTP 400 |

Khi test service gRPC dich dung, khong ket luan Gateway hong neu response la
`503`; day la mapping `UNAVAILABLE` du kien.

## 15. Kiem tra ID consistency

Doi chieu cac ID sau:

```text
userId      -> tai khoan Auth
customerId  -> Customer profile
driverId    -> Driver profile
bookingId   -> Booking
tripId      -> Trip cua booking
paymentId   -> Payment cua trip
notificationId -> Notification trong MongoDB
```

Can ghi lai:

```text
customer_id = ...
driver_id = ...
application_id = ...
booking_id = ...
trip_id = ...
payment_id = ...
notification_id = ...
```

Khong dung `userId` thay cho `customerId` hoac `driverId` neu response khong
xac nhan hai gia tri nay trung nhau.

## 16. Ket thuc va don dep

Dung cac service Node.js bang `Ctrl+C` trong tung terminal.

Dung container nhung van giu data:

```powershell
docker compose stop
```

Neu muon xoa container nhung giu volume:

```powershell
docker compose down
```

Khong dung `docker compose down -v` neu chua muon xoa database test.

## 17. Bao cao loi cho ChatGPT

Khi gap loi, gui day du:

1. Buoc dang test.
2. Method va URL Postman.
3. Request body.
4. Response status va body.
5. Log terminal cua Gateway.
6. Log service lien quan.
7. Log Kafka/MongoDB/PostgreSQL neu co.
8. Cac ID da luu.
9. Ket qua cac request health trong Postman.

Khong gui mat khau, JWT secret, connection string co password hoac du lieu
nhay cam. Co the thay bang `<redacted>`.

## 18. Tieu chi hoan thanh

Xem buoi test la dat khi:

- Infrastructure chay du.
- Tat ca 8 request health trong Postman tra HTTP 200.
- API nghiep vu tu choi request khong co JWT.
- JWT hop le cho phep request di tiep.
- Role khong phu hop bi tu choi HTTP 403.
- Password ngan va input khong hop le bi tu choi HTTP 400.
- Auth Customer thanh cong.
- Driver di qua OTP, register, approve, set password, login, online va
  location.
- Booking duoc tao qua Gateway.
- Booking goi Driver gRPC va accept goi Trip gRPC.
- Trip duoc tao/cap nhat dung ID.
- Payment goi Mock Payment Provider.
- Kafka phat va consume event.
- Notification duoc tao trong MongoDB va doc duoc qua Gateway.
- Cac truong hop loi chinh tra dung HTTP status.
- Khong co service nao bi goi truc tiep bang HTTP trong luong Gateway chinh.
