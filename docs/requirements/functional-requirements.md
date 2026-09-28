# Functional Requirements

## 1. Mục đích

Functional Requirements xác định các chức năng mà CABSystem cần cung cấp cho Customer, Driver và Admin để đáp ứng các Business Requirements đã xác định.

## 2. Quản lý tài khoản

### 2.1. FR-01 – Đăng ký tài khoản Customer

Hệ thống cho phép Customer đăng ký tài khoản bằng cách cung cấp các thông tin cần thiết.

Hệ thống kiểm tra tính hợp lệ và đảm bảo tài khoản không bị trùng trước khi tạo tài khoản.

### 2.2. FR-02 – Đăng nhập

Hệ thống cho phép Customer, Driver và Admin đăng nhập bằng thông tin tài khoản hợp lệ.

### 2.3. FR-03 – Quản lý thông tin cá nhân

Hệ thống cho phép Customer và Driver xem và cập nhật thông tin cá nhân.

## 3. Quản lý Booking

### 3.1. FR-04 – Tạo Booking

Hệ thống cho phép Customer nhập thông tin chuyến đi và tạo Booking.

### 3.2. FR-05 – Xem trạng thái Booking

Hệ thống cho phép Customer xem trạng thái hiện tại của Booking.

### 3.3. FR-06 – Hủy Booking

Hệ thống cho phép Customer hủy Booking khi Booking đang ở trạng thái cho phép hủy.

### 3.4. FR-07 – Xem lịch sử Booking

Hệ thống cho phép Customer xem lại các Booking đã tạo.

## 4. Tìm kiếm và phân công Driver

### 4.1. FR-08 – Tìm Driver phù hợp

Hệ thống tìm kiếm Driver dựa trên các tiêu chí phù hợp với Booking, bao gồm trạng thái hoạt động, vị trí và loại Vehicle.

### 4.2. FR-09 – Gửi Booking cho Driver

Hệ thống gửi thông tin Booking đến Driver phù hợp để Driver phản hồi.

### 4.3. FR-10 – Driver phản hồi Booking

Hệ thống cho phép Driver chấp nhận hoặc từ chối Booking được gửi đến.

### 4.4. FR-11 – Tìm Driver thay thế

Nếu Driver từ chối hoặc không phản hồi trong thời gian quy định, hệ thống tiếp tục tìm Driver khác phù hợp.

Customer không cần tạo lại Booking.

### 4.5. FR-12 – Thông báo không tìm được Driver

Nếu hệ thống không tìm được Driver phù hợp, hệ thống thông báo cho Customer.

## 5. Quản lý Trip

### 5.1. FR-13 – Tạo Trip

Sau khi Driver chấp nhận Booking, hệ thống tạo Trip tương ứng với Booking.

### 5.2. FR-14 – Cập nhật trạng thái Trip

Driver có thể cập nhật trạng thái Trip trong quá trình thực hiện chuyến đi.

### 5.3. FR-15 – Theo dõi Trip

Customer có thể theo dõi trạng thái Trip trong quá trình thực hiện.

### 5.4. FR-16 – Hoàn thành Trip

Driver có thể xác nhận hoàn thành Trip sau khi chuyến đi kết thúc.

### 5.5. FR-17 – Xem lịch sử Trip

Customer có thể xem lại các Trip đã thực hiện.

## 6. Quản lý Vehicle

### 6.1. FR-18 – Quản lý Vehicle cá nhân

Driver có thể thêm, xem, cập nhật và quản lý thông tin Vehicle của mình.

### 6.2. FR-19 – Quản lý Vehicle

Admin có thể quản lý thông tin Vehicle trong hệ thống để phục vụ hoạt động vận hành.

## 7. Thanh toán

### 7.1. FR-20 – Tạo Payment

Sau khi Trip hoàn thành, hệ thống tạo thông tin Payment tương ứng với Trip.

### 7.2. FR-21 – Thanh toán

Hệ thống cho phép Customer thực hiện thanh toán bằng tiền mặt hoặc hình thức thanh toán điện tử.

Đối với thanh toán điện tử, hệ thống tương tác với Payment Provider để xử lý giao dịch.

### 7.3. FR-22 – Cập nhật kết quả Payment

Hệ thống tiếp nhận và cập nhật kết quả thanh toán từ Payment Provider.

### 7.4. FR-23 – Thông báo kết quả Payment

Hệ thống thông báo kết quả thanh toán cho Customer.

Nếu thanh toán thất bại, Customer được thông báo để thực hiện lại theo chính sách của hệ thống.

## 8. Đánh giá

### 8.1. FR-24 – Đánh giá Driver

Sau khi Trip hoàn thành, hệ thống cho phép Customer đánh giá Driver.

### 8.2. FR-25 – Xem Rating

Hệ thống cho phép xem thông tin Rating đã được ghi nhận.

## 9. Quản lý Customer và Driver

### 9.1. FR-26 – Quản lý Customer

Admin có thể xem và quản lý thông tin Customer trong hệ thống.

### 9.2. FR-27 – Quản lý Driver

Admin có thể xem và quản lý thông tin Driver trong hệ thống.

## 10. Theo dõi hoạt động

### 10.1. FR-28 – Theo dõi Booking và Trip

Admin có thể theo dõi trạng thái của Booking và Trip để hỗ trợ hoạt động vận hành và xử lý các trường hợp phát sinh.

## 11. Tổng hợp Functional Requirements

Các Functional Requirements của CABSystem tập trung vào các nhóm chức năng:

- Quản lý tài khoản.
- Quản lý Booking.
- Tìm kiếm và phân công Driver.
- Quản lý Trip.
- Quản lý Vehicle.
- Thanh toán.
- Đánh giá Driver.
- Quản lý Customer và Driver.
- Theo dõi hoạt động.
