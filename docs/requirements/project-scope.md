# Project Scope

## 1. Mục đích

Xác định phạm vi nghiệp vụ của CABSystem, bao gồm các chức năng được hệ thống hỗ trợ và các chức năng nằm ngoài phạm vi của dự án.

## 2. Phạm vi hệ thống

### 2.1. Quản lý tài khoản

Hệ thống hỗ trợ:

- Đăng ký tài khoản Customer.
- Đăng nhập Customer, Driver và Admin.
- Quản lý thông tin cá nhân.
- Phân quyền sử dụng chức năng theo vai trò.

### 2.2. Quản lý Booking

Hệ thống hỗ trợ:

- Customer tạo Booking.
- Xem trạng thái Booking.
- Hủy Booking theo quy định.
- Xem lịch sử Booking.

### 2.3. Tìm kiếm và phân công Driver

Hệ thống hỗ trợ:

- Tìm Driver phù hợp với Booking.
- Xem xét trạng thái hoạt động của Driver.
- Xem xét vị trí của Driver.
- Kiểm tra Vehicle phù hợp.
- Gửi Booking cho Driver.
- Xử lý trường hợp Driver từ chối hoặc không phản hồi.
- Tìm Driver thay thế.
- Thông báo cho Customer khi không tìm được Driver.

### 2.4. Quản lý Trip

Hệ thống hỗ trợ:

- Tạo Trip sau khi Driver tiếp nhận Booking.
- Cập nhật trạng thái Trip.
- Theo dõi Trip.
- Xác nhận hoàn thành Trip.
- Xem lịch sử Trip.

### 2.5. Quản lý Vehicle

Hệ thống hỗ trợ:

- Driver quản lý Vehicle của mình.
- Admin quản lý thông tin Vehicle trong hệ thống.

### 2.6. Thanh toán

Hệ thống hỗ trợ:

- Tạo Payment sau khi Trip hoàn thành.
- Thanh toán bằng tiền mặt.
- Thanh toán điện tử do Payment Service xử lý nội bộ (mô phỏng, không tích hợp cổng thanh toán bên ngoài).
- Cập nhật kết quả Payment.
- Thông báo kết quả Payment cho Customer.
- Xử lý trường hợp Payment thất bại.

### 2.7. Đánh giá

Hệ thống hỗ trợ:

- Customer đánh giá Driver sau khi Trip hoàn thành.
- Lưu và xem Rating của Trip.

### 2.8. Quản lý và hỗ trợ bởi Admin

Admin có thể:

- Quản lý Customer.
- Quản lý Driver.
- Quản lý Vehicle.
- Theo dõi Booking.
- Theo dõi Trip.
- Hỗ trợ xử lý các trường hợp phát sinh trong quá trình hoạt động.

### 2.9. Thông báo

Hệ thống hỗ trợ:

- Tạo thông báo trong hệ thống khi có sự kiện quan trọng về Booking, Trip hoặc Payment.
- Customer và Driver xem danh sách thông báo và đánh dấu đã đọc.

## 3. Ngoài phạm vi hệ thống

Các chức năng sau không thuộc phạm vi của CABSystem:

- Quản lý tài chính và kế toán của công ty.
- Quản lý lương và hoa hồng cho Driver.
- Tuyển dụng và đào tạo Driver.
- Quản lý bảo dưỡng và sửa chữa Vehicle.
- Quản lý kho và phụ tùng.
- Chương trình khuyến mãi và khách hàng thân thiết.
- Phân tích dữ liệu nâng cao và dự báo.
- Quản lý nhiều công ty vận tải độc lập.
- Các chức năng bản đồ và định tuyến nâng cao.
- Tích hợp cổng thanh toán bên ngoài (Payment Provider).
- Tích hợp dịch vụ gửi thông báo bên ngoài (SMS, email, push notification của bên thứ ba).
- Hệ thống chăm sóc khách hàng chuyên biệt ngoài các chức năng hỗ trợ cơ bản.
- Các nghiệp vụ nội bộ không liên quan trực tiếp đến dịch vụ đặt xe.

## 4. Ranh giới hệ thống

Phạm vi chính của CABSystem được giới hạn trong quy trình:

**Customer → Booking → Tìm Driver → Driver tiếp nhận → Trip → Hoàn thành → Payment → Rating**

Trong trường hợp Driver từ chối hoặc không phản hồi:

**Booking → Tìm Driver khác → Driver tiếp nhận**

Nếu không tìm được Driver phù hợp, hệ thống thông báo cho Customer.

## 5. Actor trong phạm vi

### 5.1. Customer

Sử dụng các chức năng liên quan đến tài khoản, Booking, Trip, Payment và Rating.

### 5.2. Driver

Sử dụng các chức năng liên quan đến tài khoản, Vehicle, tiếp nhận Booking và thực hiện Trip.

### 5.3. Admin

Quản lý Customer, Driver, Vehicle và theo dõi hoạt động của Booking và Trip.

### 5.4. Hệ thống bên ngoài

Không có hệ thống bên ngoài tích hợp trong phạm vi hiện tại.

## 6. Giới hạn phạm vi

CABSystem tập trung vào quy trình đặt xe và quản lý chuyến đi từ khi Customer tạo Booking đến khi Trip hoàn thành, Payment được xử lý và Customer đánh giá Driver.

Các nghiệp vụ quản lý nội bộ khác của công ty ABC không thuộc phạm vi của dự án.
