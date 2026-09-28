# Stakeholders

## 1. Stakeholders

Stakeholders của CABSystem là các cá nhân, nhóm hoặc đơn vị có liên quan đến việc xây dựng, sử dụng, vận hành hoặc cung cấp dịch vụ cho hệ thống.

## 2. Danh sách Stakeholders

### 2.1. Ban giám đốc

Ban giám đốc là bên quản lý doanh nghiệp và có quyền quyết định đối với định hướng phát triển dịch vụ đặt xe.

Mối quan tâm:

- Hiệu quả hoạt động của dịch vụ.
- Chất lượng phục vụ khách hàng.
- Khả năng quản lý hoạt động đặt xe.
- Khả năng mở rộng hệ thống trong tương lai.

### 2.2. Nhân viên vận hành

Nhân viên vận hành chịu trách nhiệm theo dõi và hỗ trợ các hoạt động diễn ra trong hệ thống.

Mối quan tâm:

- Theo dõi Booking và Trip.
- Theo dõi hoạt động của Driver.
- Hỗ trợ xử lý các trường hợp phát sinh.
- Quản lý thông tin liên quan đến hoạt động vận hành.

Trong CABSystem, các chức năng vận hành được thực hiện thông qua actor **Admin**.

### 2.3. Customer

Customer là người trực tiếp sử dụng dịch vụ đặt xe.

Mối quan tâm:

- Đặt xe thuận tiện.
- Theo dõi trạng thái Booking và Trip.
- Nhận thông báo khi Driver được phân công hoặc không tìm được Driver.
- Thanh toán thuận tiện.
- Đánh giá Driver sau chuyến đi.
- Xem lại lịch sử sử dụng dịch vụ.

### 2.4. Driver

Driver là người cung cấp dịch vụ vận chuyển cho Customer.

Mối quan tâm:

- Nhận được Booking phù hợp.
- Biết thông tin cần thiết của chuyến đi.
- Có thể cập nhật trạng thái hoạt động.
- Có thể quản lý thông tin cá nhân và Vehicle.
- Có thể cập nhật trạng thái Trip.

### 2.5. Payment Provider

Payment Provider là đơn vị cung cấp dịch vụ thanh toán điện tử được hệ thống sử dụng khi Customer lựa chọn hình thức thanh toán điện tử.

Mối quan tâm:

- Nhận và xử lý yêu cầu thanh toán.
- Trả kết quả thanh toán cho CABSystem.
- Đảm bảo thông tin giao dịch được xử lý an toàn.

CABSystem không trực tiếp lưu thông tin thẻ hoặc thông tin tài khoản thanh toán nhạy cảm của Customer.

### 2.6. Notification Provider

Notification Provider là dịch vụ hỗ trợ gửi thông báo đến người dùng khi hệ thống cần thông báo các sự kiện liên quan đến Booking, Trip hoặc Payment.

Mối quan tâm:

- Nhận yêu cầu gửi thông báo từ CABSystem.
- Gửi thông báo đến đúng người nhận.
- Trả kết quả xử lý về cho hệ thống.

## 3. Actor chính của hệ thống

Ba actor chính tương tác trực tiếp với CABSystem là:

| Actor    | Vai trò chính                       |
| -------- | ----------------------------------- |
| Customer | Sử dụng dịch vụ đặt xe              |
| Driver   | Tiếp nhận và thực hiện Trip         |
| Admin    | Quản lý và hỗ trợ vận hành hệ thống |

Ngoài ra, **Payment Provider** và **Notification Provider** là các hệ thống bên ngoài có tương tác với CABSystem.

## 4. Phân loại Stakeholders

| Stakeholder           | Loại                 | Mức độ tương tác          |
| --------------------- | -------------------- | ------------------------- |
| Ban giám đốc          | Business Stakeholder | Gián tiếp                 |
| Nhân viên vận hành    | Internal Stakeholder | Trực tiếp thông qua Admin |
| Customer              | User                 | Trực tiếp                 |
| Driver                | User                 | Trực tiếp                 |
| Payment Provider      | External System      | Tích hợp                  |
| Notification Provider | External System      | Tích hợp                  |

## 5. Stakeholder Matrix

| Stakeholder           | Mức độ ảnh hưởng | Mức độ quan tâm | Cách quản lý         |
| --------------------- | ---------------- | --------------- | -------------------- |
| Ban giám đốc          | Cao              | Cao             | Quản lý chặt chẽ     |
| Nhân viên vận hành    | Cao              | Cao             | Quản lý chặt chẽ     |
| Customer              | Trung bình       | Cao             | Duy trì tương tác    |
| Driver                | Trung bình       | Cao             | Duy trì tương tác    |
| Payment Provider      | Cao              | Trung bình      | Duy trì quan hệ      |
| Notification Provider | Trung bình       | Trung bình      | Theo dõi và phối hợp |

## 6. Mối quan tâm của Stakeholders

CABSystem cần đáp ứng các nhu cầu chính của các bên:

- **Ban giám đốc:** cần hệ thống hỗ trợ hoạt động kinh doanh và quản lý dịch vụ.
- **Nhân viên vận hành:** cần theo dõi và xử lý các hoạt động trong hệ thống.
- **Customer:** cần đặt xe, theo dõi Trip, thanh toán và đánh giá Driver.
- **Driver:** cần nhận Booking phù hợp và quản lý quá trình thực hiện Trip.
- **Payment Provider:** cần trao đổi thông tin giao dịch với hệ thống một cách an toàn.
- **Notification Provider:** cần hỗ trợ gửi thông báo đến người dùng.

## 7. Quản lý Stakeholders

Trong quá trình phát triển CABSystem, các yêu cầu từ Stakeholders cần được xem xét và thống nhất trước khi đưa vào đặc tả hệ thống.

Các thay đổi liên quan đến quy trình đặt xe, Driver, Payment hoặc các nghiệp vụ chính cần được xác nhận với các bên liên quan trước khi triển khai.
