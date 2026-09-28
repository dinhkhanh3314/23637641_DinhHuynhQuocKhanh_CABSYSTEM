# Business Requirements

## 1. Mục đích

Business Requirements xác định các nhu cầu nghiệp vụ chính mà CABSystem cần đáp ứng để hỗ trợ hoạt động đặt xe và quản lý dịch vụ của công ty ABC.

## 2. Danh sách Business Requirements

### 2.1. BR-01 – Đặt xe trực tuyến

Hệ thống cho phép Customer tạo yêu cầu đặt xe trực tuyến bằng cách cung cấp các thông tin cần thiết cho chuyến đi.

### 2.2. BR-02 – Tìm kiếm Driver

Hệ thống hỗ trợ tìm kiếm Driver phù hợp dựa trên các thông tin liên quan đến yêu cầu đặt xe, trạng thái hoạt động, vị trí và loại Vehicle.

Nếu Driver từ chối hoặc không phản hồi, hệ thống cần hỗ trợ tìm Driver khác phù hợp.

### 2.3. BR-03 – Tiếp nhận Booking

Hệ thống cho phép Driver nhận và phản hồi các Booking được gửi đến.

Driver có thể chấp nhận hoặc từ chối Booking.

### 2.4. BR-04 – Quản lý Trip

Hệ thống hỗ trợ quản lý quá trình thực hiện Trip từ khi Driver tiếp nhận Booking cho đến khi Trip hoàn thành.

Customer có thể theo dõi trạng thái Trip trong quá trình thực hiện.

### 2.5. BR-05 – Quản lý Customer

Hệ thống hỗ trợ quản lý thông tin và tài khoản Customer.

Các nghiệp vụ chính bao gồm đăng ký, đăng nhập, quản lý thông tin cá nhân và quản lý Customer bởi Admin.

### 2.6. BR-06 – Quản lý Driver và Vehicle

Hệ thống hỗ trợ quản lý thông tin Driver và Vehicle.

Driver có thể quản lý Vehicle cá nhân, trong khi Admin có thể quản lý thông tin Driver và Vehicle phục vụ hoạt động vận hành.

### 2.7. BR-07 – Thanh toán

Hệ thống hỗ trợ Customer thanh toán sau khi Trip hoàn thành.

Customer có thể sử dụng tiền mặt hoặc hình thức thanh toán điện tử thông qua Payment Provider.

### 2.8. BR-08 – Đánh giá Driver

Hệ thống cho phép Customer đánh giá Driver sau khi Trip hoàn thành.

Thông tin đánh giá được lưu lại để phục vụ việc theo dõi chất lượng dịch vụ.

### 2.9. BR-09 – Quản lý và theo dõi hoạt động

Hệ thống hỗ trợ Admin theo dõi hoạt động của Booking, Trip, Customer và Driver.

Admin có thể quản lý thông tin liên quan và hỗ trợ xử lý các trường hợp phát sinh trong quá trình vận hành.

### 2.10. BR-10 – Xử lý trường hợp phát sinh

Hệ thống cần hỗ trợ xử lý các trường hợp phát sinh trong quá trình sử dụng dịch vụ như:

- Customer hủy Booking.
- Driver từ chối hoặc không phản hồi Booking.
- Không tìm được Driver phù hợp.
- Payment thất bại.
- Các vấn đề phát sinh trong quá trình Booking và Trip cần Admin hỗ trợ.
