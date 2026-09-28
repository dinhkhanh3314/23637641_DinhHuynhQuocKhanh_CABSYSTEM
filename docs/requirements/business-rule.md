# Business Rules

## 1. Mục đích

Business Rules xác định các quy tắc nghiệp vụ mà CABSystem phải tuân thủ trong quá trình xử lý Booking, Driver, Trip, Payment và các hoạt động liên quan.

## 2. Quy tắc tài khoản

### 2.1. BRL-01 – Thông tin tài khoản phải hợp lệ

Thông tin bắt buộc khi tạo tài khoản phải được cung cấp và đáp ứng các điều kiện kiểm tra của hệ thống.

### 2.2. BRL-02 – Tài khoản phải được xác thực

Customer, Driver và Admin phải đăng nhập trước khi sử dụng các chức năng yêu cầu xác thực.

### 2.3. BRL-03 – Quyền truy cập theo vai trò

Người dùng chỉ được phép sử dụng các chức năng phù hợp với vai trò của mình.

## 3. Quy tắc Booking

### 3.1. BRL-04 – Booking phải có thông tin hợp lệ

Booking chỉ được tạo khi các thông tin cần thiết của chuyến đi hợp lệ.

### 3.2. BRL-05 – Booking chỉ được hủy ở trạng thái cho phép

Customer chỉ được hủy Booking khi Booking đang ở trạng thái cho phép hủy.

### 3.3. BRL-06 – Customer không cần tạo lại Booking

Khi Driver từ chối hoặc không phản hồi, hệ thống phải tiếp tục tìm Driver khác cho Booking hiện tại. Customer không cần tạo Booking mới.

## 4. Quy tắc Driver

### 4.1. BRL-07 – Driver phải đang hoạt động

Driver phải ở trạng thái hoạt động mới được hệ thống lựa chọn để nhận Booking.

### 4.2. BRL-08 – Vehicle phải phù hợp

Driver được lựa chọn phải có Vehicle phù hợp với yêu cầu của Booking.

### 4.3. BRL-09 – Driver có quyền phản hồi Booking

Driver có thể chấp nhận hoặc từ chối Booking được hệ thống gửi đến.

### 4.4. BRL-10 – Driver không phản hồi

Nếu Driver không phản hồi trong thời gian quy định, hệ thống xem Booking là chưa được tiếp nhận và tiếp tục tìm Driver khác.

## 5. Quy tắc Driver Matching

### 5.1. BRL-11 – Tiêu chí tìm kiếm Driver

Hệ thống tìm kiếm Driver dựa trên các thông tin phù hợp với Booking, bao gồm trạng thái hoạt động, vị trí và loại Vehicle.

### 5.2. BRL-12 – Không tìm được Driver

Nếu không tìm được Driver phù hợp, hệ thống phải thông báo cho Customer.

### 5.3. BRL-13 – Không gửi lại cho Driver đã từ chối

Khi tìm Driver thay thế, hệ thống không tiếp tục gửi cùng Booking cho Driver đã từ chối Booking đó.

## 6. Quy tắc Trip

### 6.1. BRL-14 – Trip được tạo sau khi Driver chấp nhận

Trip chỉ được tạo sau khi một Driver chấp nhận Booking.

### 6.2. BRL-15 – Trạng thái Trip phải theo đúng quy trình

Trip phải được cập nhật theo trình tự nghiệp vụ phù hợp:

**Được tạo → Đang thực hiện → Hoàn thành**

### 6.3. BRL-16 – Trip chỉ được hoàn thành khi đang thực hiện

Driver chỉ có thể xác nhận hoàn thành Trip khi Trip đang ở trạng thái đang thực hiện.

## 7. Quy tắc Payment

### 7.1. BRL-17 – Payment chỉ thực hiện sau khi Trip hoàn thành

Customer chỉ được thực hiện Payment sau khi Trip đã hoàn thành.

### 7.2. BRL-18 – Hỗ trợ nhiều hình thức thanh toán

CABSystem hỗ trợ thanh toán bằng tiền mặt và thanh toán điện tử thông qua Payment Provider.

### 7.3. BRL-19 – Xử lý Payment thất bại

Khi Payment thất bại, hệ thống phải ghi nhận kết quả và thông báo cho Customer.

Customer có thể thực hiện lại Payment theo chính sách của hệ thống.

### 7.4. BRL-20 – Không lưu thông tin thanh toán nhạy cảm

CABSystem không lưu trực tiếp thông tin thẻ hoặc thông tin tài khoản thanh toán nhạy cảm của Customer.

## 8. Quy tắc Rating

### 8.1. BRL-21 – Chỉ đánh giá sau khi Trip hoàn thành

Customer chỉ được đánh giá Driver sau khi Trip hoàn thành.

### 8.2. BRL-22 – Không đánh giá nhiều lần

Một Trip chỉ được ghi nhận Rating theo quy định của hệ thống và không cho phép Customer tạo nhiều Rating cho cùng một Trip.

## 9. Quy tắc Admin

### 9.1. BRL-23 – Admin được quản lý dữ liệu theo quyền

Admin chỉ được thực hiện các chức năng quản lý phù hợp với quyền được cấp.

### 9.2. BRL-24 – Admin không phân công Driver trong quy trình thông thường

Việc tìm kiếm và phân công Driver được hệ thống thực hiện tự động trong quy trình thông thường.

Admin chỉ tham gia khi cần theo dõi hoặc hỗ trợ xử lý trường hợp phát sinh.
