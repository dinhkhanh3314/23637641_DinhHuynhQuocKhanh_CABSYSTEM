# Non-Functional Requirements

## 1. Mục đích

Non-Functional Requirements xác định các yêu cầu về chất lượng, bảo mật, hiệu năng, độ tin cậy, khả năng sử dụng, bảo trì và quản lý dữ liệu của CABSystem.

## 2. Security

### 2.1. NFR-01 – Xác thực

Hệ thống phải yêu cầu người dùng xác thực trước khi truy cập các chức năng cần đăng nhập.

### 2.2. NFR-02 – Phân quyền

Hệ thống phải phân quyền chức năng dựa trên vai trò của người dùng gồm Customer, Driver và Admin.

### 2.3. NFR-03 – Bảo vệ mật khẩu

Mật khẩu người dùng phải được bảo vệ và không được lưu dưới dạng văn bản thuần.

### 2.4. NFR-04 – Bảo vệ dữ liệu cá nhân

Thông tin cá nhân của Customer và Driver phải được bảo vệ, chỉ cho phép truy cập theo quyền được cấp.

### 2.5. NFR-05 – Bảo vệ thông tin thanh toán

Hệ thống không được lưu trực tiếp thông tin thẻ hoặc thông tin tài khoản thanh toán nhạy cảm của Customer.

## 3. Performance

### 3.1. NFR-06 – Thời gian phản hồi

Các chức năng thông thường của hệ thống cần có thời gian phản hồi phù hợp để người dùng có thể thao tác thuận tiện.

### 3.2. NFR-07 – Xử lý đồng thời

Hệ thống phải có khả năng xử lý nhiều yêu cầu từ các Customer và Driver trong cùng thời điểm.

### 3.3. NFR-08 – Driver Matching

Quá trình tìm kiếm Driver cần được thực hiện trong thời gian phù hợp để hạn chế thời gian Customer phải chờ.

## 4. Availability

### 4.1. NFR-09 – Khả năng hoạt động

Các chức năng chính của CABSystem cần có khả năng hoạt động ổn định trong thời gian cung cấp dịch vụ.

### 4.2. NFR-10 – Lỗi dịch vụ thành phần

Khi Payment Service hoặc Notification Service gặp lỗi, hệ thống phải xử lý lỗi phù hợp và các chức năng còn lại (Booking, Trip) vẫn hoạt động.

## 5. Reliability

### 5.1. NFR-11 – Tính toàn vẹn dữ liệu

Hệ thống phải đảm bảo dữ liệu Booking, Trip và Payment được lưu trữ chính xác và nhất quán.

### 5.2. NFR-12 – Xử lý lỗi

Khi xảy ra lỗi trong quá trình xử lý, hệ thống phải thông báo phù hợp và không làm mất dữ liệu đã được xử lý thành công.

### 5.3. NFR-13 – Payment

Kết quả Payment phải được ghi nhận chính xác. Trường hợp thanh toán thất bại phải được xử lý mà không làm thay đổi sai trạng thái của Trip.

## 6. Usability

### 6.1. NFR-14 – Giao diện dễ sử dụng

Các chức năng dành cho Customer, Driver và Admin cần được tổ chức rõ ràng để người dùng có thể thực hiện các thao tác cần thiết.

### 6.2. NFR-15 – Thông báo

Hệ thống cần cung cấp thông báo rõ ràng khi xảy ra các sự kiện quan trọng như Booking được tiếp nhận, không tìm được Driver, Trip hoàn thành hoặc Payment thất bại.

## 7. Maintainability

### 7.1. NFR-16 – Tổ chức hệ thống

Các chức năng của hệ thống cần được tổ chức rõ ràng để thuận tiện cho việc bảo trì và phát triển.

### 7.2. NFR-17 – Khả năng mở rộng

Hệ thống cần có khả năng mở rộng thêm chức năng khi nhu cầu hoạt động của công ty tăng lên.

### 7.3. NFR-18 – Xử lý lỗi và ghi nhận sự kiện

Hệ thống cần có cơ chế xử lý lỗi và ghi nhận các sự kiện cần thiết để hỗ trợ việc kiểm tra và bảo trì.

## 8. Data Management

### 8.1. NFR-19 – Tính nhất quán dữ liệu

Dữ liệu giữa Booking, Trip, Payment và Rating phải được duy trì nhất quán trong suốt quá trình xử lý.

### 8.2. NFR-20 – Bảo vệ dữ liệu

Dữ liệu của người dùng và dữ liệu nghiệp vụ phải được bảo vệ khỏi việc truy cập hoặc thay đổi trái phép.

### 8.3. NFR-21 – Xử lý sự kiện giữa các service

Các sự kiện trao đổi giữa các service (Booking, Trip, Payment, Driver, Notification) không được mất và không được xử lý trùng làm sai dữ liệu. Service nhận sự kiện phải xử lý idempotent.
