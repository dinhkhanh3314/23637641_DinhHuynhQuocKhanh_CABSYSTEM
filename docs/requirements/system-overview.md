# System Overview

## 1. Tổng quan hệ thống

CABSystem là hệ thống hỗ trợ công ty ABC quản lý dịch vụ đặt xe trực tuyến. Hệ thống tập trung vào quy trình từ khi Customer tạo yêu cầu đặt xe, tìm kiếm và tiếp nhận Driver, thực hiện Trip, thanh toán cho đến đánh giá Driver.

Hệ thống cung cấp các chức năng cho Customer, Driver và Admin nhằm giảm các thao tác thủ công và hỗ trợ quản lý hoạt động đặt xe tập trung.

## 2. Bối cảnh

Công ty ABC là doanh nghiệp cung cấp dịch vụ đặt xe trực tuyến. Hiện tại, khách hàng có thể liên hệ với tổng đài hoặc sử dụng một ứng dụng đơn giản để yêu cầu xe.

Tuy nhiên, hệ thống hiện tại còn một số hạn chế như việc tìm kiếm và phân công tài xế còn thực hiện thủ công, khách hàng khó theo dõi trạng thái chuyến đi, việc thanh toán chưa được tập trung và khả năng quản lý hoạt động tài xế còn hạn chế.

Do đó, công ty cần xây dựng CABSystem nhằm hỗ trợ quản lý quy trình đặt xe và thực hiện chuyến đi một cách tập trung hơn.

## 3. Mục tiêu hệ thống

CABSystem được xây dựng nhằm:

- Cho phép Customer đăng ký, đăng nhập và đặt xe trực tuyến.
- Hỗ trợ tìm kiếm Driver phù hợp với yêu cầu đặt xe.
- Cho phép Driver tiếp nhận và thực hiện Trip.
- Cho phép Customer theo dõi trạng thái Booking và Trip.
- Hỗ trợ thanh toán sau khi Trip hoàn thành.
- Cho phép Customer đánh giá Driver.
- Hỗ trợ Admin quản lý Customer, Driver và Vehicle.
- Hỗ trợ Admin theo dõi hoạt động Booking và Trip.
- Giảm các thao tác thủ công trong quá trình vận hành dịch vụ đặt xe.

## 4. Đối tượng sử dụng

### 4.1. Customer

Customer là khách hàng sử dụng dịch vụ đặt xe.

Các chức năng chính:

- Đăng ký và đăng nhập.
- Quản lý thông tin cá nhân.
- Tạo Booking.
- Theo dõi trạng thái Booking và Trip.
- Hủy Booking khi đáp ứng điều kiện.
- Xem lịch sử Booking và Trip.
- Thanh toán.
- Đánh giá Driver sau khi Trip hoàn thành.

### 4.2. Driver

Driver là tài xế thực hiện các chuyến xe được hệ thống phân công.

Các chức năng chính:

- Đăng nhập.
- Quản lý thông tin cá nhân.
- Quản lý Vehicle.
- Cập nhật trạng thái hoạt động.
- Nhận và phản hồi Booking.
- Cập nhật trạng thái Trip.
- Thực hiện và hoàn thành Trip.

### 4.3. Admin

Admin là người quản lý và hỗ trợ vận hành hệ thống.

Các chức năng chính:

- Quản lý Customer.
- Quản lý Driver.
- Quản lý Vehicle.
- Theo dõi Booking và Trip.
- Hỗ trợ xử lý các trường hợp phát sinh trong quá trình vận hành.

## 5. Quy trình nghiệp vụ tổng quát

Quy trình chính của CABSystem được thực hiện theo trình tự:

**Customer → Tạo Booking → Tìm Driver → Driver tiếp nhận → Tạo Trip → Thực hiện Trip → Hoàn thành Trip → Thanh toán → Đánh giá Driver**

Trong trường hợp Driver từ chối hoặc không phản hồi Booking, hệ thống sẽ tiếp tục tìm Driver khác phù hợp.

Nếu không tìm được Driver phù hợp, hệ thống thông báo cho Customer.

## 6. Phạm vi tổng quan

CABSystem tập trung vào các nhóm nghiệp vụ chính:

- Quản lý tài khoản.
- Quản lý Booking.
- Tìm kiếm và tiếp nhận Driver.
- Quản lý Trip.
- Quản lý Vehicle.
- Thanh toán.
- Đánh giá Driver.
- Quản lý và hỗ trợ vận hành bởi Admin.

Các nghiệp vụ không trực tiếp phục vụ quy trình đặt xe và thực hiện Trip không thuộc phạm vi chính của hệ thống.

## 7. Định hướng hệ thống

CABSystem cần đáp ứng các yêu cầu cơ bản về:

- Bảo mật tài khoản và dữ liệu người dùng.
- Phân quyền theo từng loại người dùng.
- Đảm bảo dữ liệu Booking, Trip và Payment được quản lý nhất quán.
- Hỗ trợ xử lý nhiều yêu cầu của người dùng.
- Đảm bảo hệ thống vẫn hoạt động khi các dịch vụ bên ngoài như Payment hoặc Notification xảy ra lỗi.
- Có khả năng bảo trì và mở rộng khi nhu cầu của công ty tăng lên.
