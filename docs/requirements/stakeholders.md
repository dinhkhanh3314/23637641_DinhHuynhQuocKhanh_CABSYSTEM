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

## 3. Actor chính của hệ thống

Ba actor chính tương tác trực tiếp với CABSystem là:

| Actor    | Vai trò chính                       |
| -------- | ----------------------------------- |
| Customer | Sử dụng dịch vụ đặt xe              |
| Driver   | Tiếp nhận và thực hiện Trip         |
| Admin    | Quản lý và hỗ trợ vận hành hệ thống |

CABSystem không tích hợp hệ thống bên ngoài trong phạm vi hiện tại. Thanh toán điện tử (mô phỏng) và thông báo trong hệ thống do **Payment Service** và **Notification Service** xử lý nội bộ.

## 4. Phân loại Stakeholders

| Stakeholder           | Loại                 | Mức độ tương tác          |
| --------------------- | -------------------- | ------------------------- |
| Ban giám đốc          | Business Stakeholder | Gián tiếp                 |
| Nhân viên vận hành    | Internal Stakeholder | Trực tiếp thông qua Admin |
| Customer              | User                 | Trực tiếp                 |
| Driver                | User                 | Trực tiếp                 |

## 5. Stakeholder Matrix

| Stakeholder           | Mức độ ảnh hưởng | Mức độ quan tâm | Cách quản lý         |
| --------------------- | ---------------- | --------------- | -------------------- |
| Ban giám đốc          | Cao              | Cao             | Quản lý chặt chẽ     |
| Nhân viên vận hành    | Cao              | Cao             | Quản lý chặt chẽ     |
| Customer              | Trung bình       | Cao             | Duy trì tương tác    |
| Driver                | Trung bình       | Cao             | Duy trì tương tác    |

## 6. Mối quan tâm của Stakeholders

CABSystem cần đáp ứng các nhu cầu chính của các bên:

- **Ban giám đốc:** cần hệ thống hỗ trợ hoạt động kinh doanh và quản lý dịch vụ.
- **Nhân viên vận hành:** cần theo dõi và xử lý các hoạt động trong hệ thống.
- **Customer:** cần đặt xe, theo dõi Trip, thanh toán và đánh giá Driver.
- **Driver:** cần nhận Booking phù hợp và quản lý quá trình thực hiện Trip.

## 7. Quản lý Stakeholders

Trong quá trình phát triển CABSystem, các yêu cầu từ Stakeholders cần được xem xét và thống nhất trước khi đưa vào đặc tả hệ thống.

Các thay đổi liên quan đến quy trình đặt xe, Driver, Payment hoặc các nghiệp vụ chính cần được xác nhận với các bên liên quan trước khi triển khai.
