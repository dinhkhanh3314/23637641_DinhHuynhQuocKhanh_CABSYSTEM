# Business Processes

## 1. Mục đích

Business Processes mô tả các quy trình nghiệp vụ chính của CABSystem, từ khi Customer tạo yêu cầu đặt xe cho đến khi Trip hoàn thành, thanh toán và đánh giá Driver.

## 2. Quy trình đặt xe

1. Customer đăng nhập vào hệ thống.
2. Customer nhập thông tin chuyến đi.
3. Customer gửi yêu cầu đặt xe.
4. Hệ thống kiểm tra thông tin Booking.
5. Hệ thống tạo Booking.
6. Booking được chuyển sang trạng thái chờ tìm Driver.
7. Hệ thống bắt đầu tìm kiếm Driver phù hợp.

## 3. Quy trình tìm kiếm và tiếp nhận Driver

1. Hệ thống lấy thông tin Booking.
2. Hệ thống tìm các Driver đang hoạt động.
3. Hệ thống kiểm tra Vehicle phù hợp với yêu cầu.
4. Hệ thống xem xét vị trí của Driver.
5. Hệ thống lựa chọn Driver phù hợp.
6. Hệ thống gửi Booking cho Driver.
7. Driver xem thông tin Booking.
8. Driver phản hồi Booking.

Nếu Driver chấp nhận:

- Hệ thống ghi nhận Driver.
- Hệ thống tạo Trip.
- Booking được chuyển sang trạng thái đã tiếp nhận.

Nếu Driver từ chối hoặc không phản hồi:

- Hệ thống tìm Driver khác.
- Customer không cần tạo lại Booking.

Nếu không tìm được Driver phù hợp:

- Hệ thống thông báo cho Customer.
- Booking không được tiếp tục thực hiện.

## 4. Quy trình thực hiện Trip

1. Driver tiếp nhận Booking.
2. Hệ thống tạo Trip.
3. Driver bắt đầu thực hiện Trip.
4. Driver cập nhật trạng thái Trip trong quá trình thực hiện.
5. Customer theo dõi trạng thái Trip.
6. Driver hoàn thành chuyến đi.
7. Hệ thống cập nhật Trip thành hoàn thành.
8. Hệ thống chuyển sang quy trình thanh toán.

## 5. Quy trình hủy Booking

1. Customer chọn Booking cần hủy.
2. Hệ thống kiểm tra trạng thái Booking.
3. Hệ thống kiểm tra Booking có được phép hủy hay không.
4. Customer xác nhận hủy.
5. Hệ thống cập nhật Booking thành đã hủy.
6. Hệ thống thông báo kết quả cho Customer.

Nếu Booking không còn ở trạng thái được phép hủy, hệ thống thông báo và không thực hiện thao tác hủy.

## 6. Quy trình thanh toán

1. Trip được hoàn thành.
2. Hệ thống tạo Payment (bất đồng bộ ngay sau khi Trip hoàn thành).
3. Hệ thống xác định số tiền cần thanh toán.
4. Customer lựa chọn hình thức thanh toán.

Nếu Customer thanh toán bằng tiền mặt:

1. Hệ thống ghi nhận hình thức thanh toán.
2. Payment được cập nhật theo kết quả thực tế.

Nếu Customer thanh toán điện tử:

1. Payment Service xử lý giao dịch trong hệ thống (mô phỏng).
2. Payment Service xác định kết quả giao dịch.
3. Hệ thống cập nhật kết quả Payment.
4. Hệ thống thông báo kết quả cho Customer.

Nếu thanh toán thất bại, hệ thống thông báo cho Customer và cho phép thực hiện lại theo chính sách của hệ thống.

## 7. Quy trình đánh giá Driver

1. Trip được hoàn thành.
2. Customer mở thông tin Trip.
3. Hệ thống kiểm tra Trip đã hoàn thành và chưa được đánh giá.
4. Customer nhập Rating.
5. Customer gửi đánh giá.
6. Hệ thống kiểm tra thông tin.
7. Hệ thống lưu Rating.
8. Hệ thống thông báo đánh giá thành công.

## 8. Quy trình quản lý và hỗ trợ bởi Admin

1. Admin đăng nhập hệ thống.
2. Admin xem thông tin Customer, Driver hoặc Vehicle.
3. Admin theo dõi Booking và Trip.
4. Admin xác định các trường hợp cần hỗ trợ.
5. Admin thực hiện các thao tác quản lý được phép.
6. Hệ thống cập nhật thông tin và trạng thái liên quan.

Admin chủ yếu thực hiện vai trò quản lý và hỗ trợ vận hành, không trực tiếp phân công Driver trong quy trình đặt xe thông thường.

## 9. Quy trình tổng thể

Quy trình nghiệp vụ tổng thể của CABSystem:

**Customer → Tạo Booking → Tìm Driver → Driver tiếp nhận → Tạo Trip → Thực hiện Trip → Hoàn thành Trip → Thanh toán → Đánh giá Driver**

Trường hợp Driver từ chối hoặc không phản hồi:

**Tìm Driver → Driver từ chối/không phản hồi → Tìm Driver khác**

Trường hợp không còn Driver phù hợp:

**Tìm Driver → Không tìm được Driver → Thông báo Customer**

Trường hợp Customer hủy Booking:

**Booking → Kiểm tra điều kiện hủy → Hủy Booking**

## 10. Mối liên hệ giữa các quy trình

Các quy trình nghiệp vụ có mối liên hệ theo thứ tự chính:

| Quy trình                    | Quy trình tiếp theo                        |
| ---------------------------- | ------------------------------------------ |
| Đặt xe                       | Tìm kiếm và tiếp nhận Driver               |
| Tìm kiếm và tiếp nhận Driver | Thực hiện Trip                             |
| Thực hiện Trip               | Thanh toán                                 |
| Thanh toán                   | Đánh giá Driver                            |
| Hủy Booking                  | Kết thúc Booking                           |
| Quản lý và hỗ trợ Admin      | Có thể tham gia xử lý khi phát sinh vấn đề |

## 11. Trạng thái nghiệp vụ chính

### 11.1. Booking

Các trạng thái chính:

**Chờ tìm Driver → Đã gửi Driver → Đã tiếp nhận**

Trong trường hợp Driver từ chối hoặc không phản hồi:

**Đã gửi Driver → Từ chối/Không phản hồi → Tìm Driver khác**

Các trường hợp kết thúc:

**Booking → Đã hủy**

### 11.2. Trip

Các trạng thái chính:

**Được tạo → Đang thực hiện → Hoàn thành**

### 11.3. Payment

Các trạng thái chính:

**Chờ thanh toán → Đang xử lý → Thành công**

Nếu thanh toán thất bại:

**Chờ thanh toán/Đang xử lý → Thất bại → Thanh toán lại**
