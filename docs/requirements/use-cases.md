# Use Cases

## 1. Mục đích

Use Cases mô tả các chức năng của CABSystem dưới góc nhìn tương tác giữa Actor và hệ thống. Nội dung được xây dựng dựa trên các Functional Requirements đã xác định.

## 2. Actors

| Actor            | Mô tả                                       |
| ---------------- | ------------------------------------------- |
| Customer         | Người sử dụng dịch vụ đặt xe                |
| Driver           | Tài xế tiếp nhận và thực hiện Trip          |
| Admin            | Người quản lý và hỗ trợ vận hành hệ thống   |

## 3. Danh sách Use Cases

| Mã    | Use Case                  | Actor                      |
| ----- | ------------------------- | -------------------------- |
| UC-01 | Đăng ký tài khoản         | Customer                   |
| UC-02 | Đăng nhập                 | Customer, Driver, Admin    |
| UC-03 | Quản lý thông tin cá nhân | Customer, Driver           |
| UC-04 | Tạo Booking               | Customer                   |
| UC-05 | Xem trạng thái Booking    | Customer                   |
| UC-06 | Hủy Booking               | Customer                   |
| UC-07 | Xem lịch sử Booking       | Customer                   |
| UC-08 | Tìm Driver phù hợp        | System                     |
| UC-09 | Tiếp nhận Booking         | Driver                     |
| UC-10 | Tìm Driver thay thế       | System                     |
| UC-11 | Theo dõi Trip             | Customer                   |
| UC-12 | Cập nhật trạng thái Trip  | Driver                     |
| UC-13 | Hoàn thành Trip           | Driver                     |
| UC-14 | Xem lịch sử Trip          | Customer                   |
| UC-15 | Quản lý Vehicle cá nhân   | Driver                     |
| UC-16 | Quản lý Vehicle           | Admin                      |
| UC-17 | Thanh toán | Customer |
| UC-18 | Xem kết quả Payment       | Customer                   |
| UC-19 | Đánh giá Driver           | Customer                   |
| UC-20 | Quản lý Customer          | Admin                      |
| UC-21 | Quản lý Driver            | Admin                      |
| UC-22 | Theo dõi Booking và Trip  | Admin                      |
| UC-23 | Xem thông báo | Customer, Driver |

## 4. Quan hệ giữa các Use Cases

### 4.1. Quy trình Booking

`UC-04 Tạo Booking` → `UC-08 Tìm Driver phù hợp` → `UC-09 Tiếp nhận Booking`

Nếu Driver từ chối hoặc không phản hồi:

`UC-09 Tiếp nhận Booking` → `UC-10 Tìm Driver thay thế` → `UC-09 Tiếp nhận Booking`

Nếu không tìm được Driver phù hợp, hệ thống thông báo cho Customer.

### 4.2. Quy trình Trip

Sau khi Driver tiếp nhận Booking:

`UC-09 Tiếp nhận Booking` → `UC-11 Theo dõi Trip`
`UC-12 Cập nhật trạng thái Trip` → `UC-13 Hoàn thành Trip`

### 4.3. Quy trình Payment

Sau khi Trip hoàn thành:

`UC-13 Hoàn thành Trip` → `UC-17 Thanh toán` → `UC-18 Xem kết quả Payment`

### 4.4. Quy trình Rating

Sau khi Trip hoàn thành:

`UC-13 Hoàn thành Trip` → `UC-19 Đánh giá Driver`

## 5. Đặc tả Use Case

### 5.1. UC-01 – Đăng ký tài khoản

**Actor:** Customer

**Mục tiêu:** Tạo tài khoản để sử dụng dịch vụ.

**Tiền điều kiện:**

- Customer chưa có tài khoản.
- Customer đang ở chức năng đăng ký.

**Luồng chính:**

1. Customer chọn chức năng đăng ký.
2. Hệ thống hiển thị biểu mẫu đăng ký.
3. Customer nhập thông tin cần thiết.
4. Customer gửi thông tin đăng ký.
5. Hệ thống kiểm tra tính hợp lệ.
6. Hệ thống kiểm tra tài khoản đã tồn tại hay chưa.
7. Hệ thống tạo tài khoản.
8. Hệ thống thông báo đăng ký thành công.

**Luồng thay thế và ngoại lệ:**

- Thông tin không hợp lệ → hệ thống thông báo lỗi và yêu cầu Customer nhập lại.
- Tài khoản đã tồn tại → hệ thống thông báo và không tạo tài khoản mới.

**Quy tắc nghiệp vụ:**

- Thông tin định danh phải là duy nhất.
- Các thông tin bắt buộc phải được cung cấp.
- Mật khẩu không được lưu dưới dạng văn bản thuần.

**Dữ liệu đầu vào:** Thông tin định danh, thông tin cá nhân, mật khẩu.

**Kết quả:** Tài khoản Customer được tạo thành công.

### 5.2. UC-02 – Đăng nhập

**Actor:** Customer, Driver, Admin

**Mục tiêu:** Truy cập hệ thống bằng tài khoản hợp lệ.

**Tiền điều kiện:**

- Người dùng đã có tài khoản.

**Luồng chính:**

1. Người dùng nhập thông tin đăng nhập.
2. Hệ thống kiểm tra thông tin.
3. Hệ thống xác thực tài khoản.
4. Hệ thống xác định vai trò người dùng.
5. Hệ thống cho phép truy cập các chức năng tương ứng.

**Luồng thay thế và ngoại lệ:**

- Thông tin đăng nhập không hợp lệ → thông báo lỗi.
- Tài khoản không được phép truy cập → từ chối đăng nhập.

**Kết quả:** Người dùng đăng nhập thành công.

### 5.3. UC-03 – Quản lý thông tin cá nhân

**Actor:** Customer, Driver

**Mục tiêu:** Xem và cập nhật thông tin cá nhân.

**Tiền điều kiện:**

- Người dùng đã đăng nhập.

**Luồng chính:**

1. Người dùng mở thông tin cá nhân.
2. Hệ thống hiển thị thông tin hiện tại.
3. Người dùng cập nhật thông tin.
4. Hệ thống kiểm tra dữ liệu.
5. Hệ thống lưu thông tin mới.
6. Hệ thống thông báo cập nhật thành công.

**Ngoại lệ:**

- Dữ liệu không hợp lệ → hệ thống thông báo lỗi và không cập nhật.

### 5.4. UC-04 – Tạo Booking

**Actor:** Customer

**Mục tiêu:** Tạo yêu cầu đặt xe.

**Tiền điều kiện:**

- Customer đã đăng nhập.

**Luồng chính:**

1. Customer chọn chức năng đặt xe.
2. Hệ thống hiển thị biểu mẫu Booking.
3. Customer nhập thông tin chuyến đi.
4. Customer gửi yêu cầu.
5. Hệ thống kiểm tra thông tin.
6. Hệ thống tạo Booking.
7. Hệ thống chuyển Booking sang trạng thái chờ tìm Driver.

**Ngoại lệ:**

- Thông tin Booking không hợp lệ → hệ thống thông báo lỗi.

### 5.5. UC-05 – Xem trạng thái Booking

**Actor:** Customer

**Mục tiêu:** Theo dõi trạng thái Booking.

**Tiền điều kiện:**

- Customer đã đăng nhập.
- Customer có Booking.

**Luồng chính:**

1. Customer chọn Booking.
2. Hệ thống lấy trạng thái hiện tại.
3. Hệ thống hiển thị trạng thái Booking.

### 5.6. UC-06 – Hủy Booking

**Actor:** Customer

**Mục tiêu:** Hủy Booking khi chưa được thực hiện.

**Tiền điều kiện:**

- Customer đã đăng nhập.
- Booking đang ở trạng thái cho phép hủy.

**Luồng chính:**

1. Customer chọn Booking.
2. Customer chọn hủy Booking.
3. Hệ thống kiểm tra trạng thái Booking.
4. Hệ thống yêu cầu xác nhận.
5. Customer xác nhận.
6. Hệ thống cập nhật Booking thành đã hủy.
7. Hệ thống thông báo kết quả.

**Ngoại lệ:**

- Booking không còn cho phép hủy → hệ thống thông báo và không thực hiện hủy.

### 5.7. UC-07 – Xem lịch sử Booking

**Actor:** Customer

**Mục tiêu:** Xem các Booking đã tạo.

**Tiền điều kiện:**

- Customer đã đăng nhập.

**Luồng chính:**

1. Customer chọn lịch sử Booking.
2. Hệ thống lấy danh sách Booking.
3. Hệ thống hiển thị danh sách.

### 5.8. UC-08 – Tìm Driver phù hợp

**Actor:** System

**Mục tiêu:** Tìm Driver phù hợp với Booking.

**Tiền điều kiện:**

- Booking đã được tạo.
- Booking đang chờ tìm Driver.

**Luồng chính:**

1. Hệ thống lấy thông tin Booking.
2. Hệ thống tìm các Driver đang hoạt động.
3. Hệ thống kiểm tra Vehicle phù hợp.
4. Hệ thống xem xét vị trí Driver.
5. Hệ thống lựa chọn Driver phù hợp.
6. Hệ thống gửi Booking cho Driver.

**Ngoại lệ:**

- Không tìm thấy Driver phù hợp → hệ thống chuyển sang UC-10 hoặc thông báo cho Customer khi không còn Driver phù hợp.

### 5.9. UC-09 – Tiếp nhận Booking

**Actor:** Driver

**Mục tiêu:** Cho phép Driver phản hồi Booking được gửi đến.

**Tiền điều kiện:**

- Driver đang hoạt động.
- Driver nhận được Booking.

**Luồng chính:**

1. Driver nhận thông tin Booking.
2. Driver xem thông tin chuyến đi.
3. Driver chọn chấp nhận Booking.
4. Hệ thống ghi nhận Driver.
5. Hệ thống cập nhật trạng thái Booking thành đã tiếp nhận.
6. Hệ thống tạo Trip tương ứng (bất đồng bộ; Trip xuất hiện sau khi Booking được cập nhật trong thời gian ngắn).

**Luồng thay thế:**

- Driver từ chối Booking → hệ thống chuyển sang UC-10.
- Driver không phản hồi trong thời gian quy định → hệ thống chuyển sang UC-10.

### 5.10. UC-10 – Tìm Driver thay thế

**Actor:** System

**Mục tiêu:** Tìm Driver khác khi Driver trước đó từ chối hoặc không phản hồi.

**Tiền điều kiện:**

- Booking chưa bị hủy.
- Driver trước đó đã từ chối hoặc không phản hồi.

**Luồng chính:**

1. Hệ thống xác định Booking cần tìm Driver mới.
2. Hệ thống loại Driver đã từ chối hoặc không phản hồi.
3. Hệ thống tìm Driver phù hợp khác.
4. Hệ thống gửi Booking cho Driver mới.

**Ngoại lệ:**

- Không còn Driver phù hợp → hệ thống thông báo cho Customer.

### 5.11. UC-11 – Theo dõi Trip

**Actor:** Customer

**Mục tiêu:** Theo dõi trạng thái Trip.

**Tiền điều kiện:**

- Customer đã đăng nhập.
- Trip đã được tạo.

**Luồng chính:**

1. Customer chọn Trip.
2. Hệ thống lấy trạng thái Trip.
3. Hệ thống hiển thị trạng thái hiện tại.

### 5.12. UC-12 – Cập nhật trạng thái Trip

**Actor:** Driver

**Mục tiêu:** Cập nhật trạng thái Trip trong quá trình thực hiện.

**Tiền điều kiện:**

- Driver đã được phân công.
- Trip đã được tạo.

**Luồng chính:**

1. Driver mở Trip.
2. Driver chọn trạng thái mới.
3. Hệ thống kiểm tra trạng thái hợp lệ.
4. Hệ thống cập nhật Trip.
5. Hệ thống cung cấp trạng thái mới cho Customer.

### 5.13. UC-13 – Hoàn thành Trip

**Actor:** Driver

**Mục tiêu:** Xác nhận Trip đã hoàn thành.

**Tiền điều kiện:**

- Trip đang được thực hiện.

**Luồng chính:**

1. Driver chọn hoàn thành Trip.
2. Hệ thống kiểm tra trạng thái Trip.
3. Hệ thống cập nhật Trip thành hoàn thành.
4. Hệ thống tạo thông tin Payment.
5. Hệ thống cho phép Customer thực hiện thanh toán.

### 5.14. UC-14 – Xem lịch sử Trip

**Actor:** Customer

**Mục tiêu:** Xem các Trip đã thực hiện.

**Tiền điều kiện:**

- Customer đã đăng nhập.

**Luồng chính:**

1. Customer chọn lịch sử Trip.
2. Hệ thống lấy danh sách Trip.
3. Hệ thống hiển thị danh sách.

### 5.15. UC-15 – Quản lý Vehicle cá nhân

**Actor:** Driver

**Mục tiêu:** Quản lý Vehicle của Driver.

**Tiền điều kiện:**

- Driver đã đăng nhập.

**Luồng chính:**

1. Driver mở chức năng quản lý Vehicle.
2. Hệ thống hiển thị Vehicle hiện tại.
3. Driver thêm, cập nhật hoặc xem thông tin Vehicle.
4. Hệ thống kiểm tra dữ liệu.
5. Hệ thống lưu thông tin.

### 5.16. UC-16 – Quản lý Vehicle

**Actor:** Admin

**Mục tiêu:** Quản lý thông tin Vehicle trong hệ thống.

**Tiền điều kiện:**

- Admin đã đăng nhập.

**Luồng chính:**

1. Admin mở chức năng quản lý Vehicle.
2. Hệ thống hiển thị danh sách Vehicle.
3. Admin xem hoặc cập nhật thông tin Vehicle.
4. Hệ thống kiểm tra dữ liệu.
5. Hệ thống lưu thay đổi.

### 5.17. UC-17 – Thanh toán

**Actor:** Customer

**Mục tiêu:** Thanh toán chi phí Trip.

**Tiền điều kiện:**

- Trip đã hoàn thành.
- Payment đã được tạo.

**Luồng chính:**

1. Customer chọn hình thức thanh toán.
2. Nếu chọn tiền mặt, hệ thống ghi nhận thanh toán theo hình thức tiền mặt.
3. Nếu chọn thanh toán điện tử, Payment Service xử lý giao dịch trong hệ thống (mô phỏng).
4. Payment Service xác định kết quả giao dịch.
5. Hệ thống cập nhật kết quả Payment.
6. Hệ thống thông báo kết quả cho Customer.

**Ngoại lệ:**

- Thanh toán điện tử thất bại → hệ thống ghi nhận Payment thất bại và thông báo Customer thực hiện lại theo chính sách.

### 5.18. UC-18 – Xem kết quả Payment

**Actor:** Customer

**Mục tiêu:** Xem kết quả thanh toán.

**Tiền điều kiện:**

- Customer đã thực hiện hoặc có Payment.

**Luồng chính:**

1. Customer mở thông tin Payment.
2. Hệ thống lấy kết quả Payment.
3. Hệ thống hiển thị trạng thái thanh toán.

### 5.19. UC-19 – Đánh giá Driver

**Actor:** Customer

**Mục tiêu:** Đánh giá Driver sau Trip.

**Tiền điều kiện:**

- Trip đã hoàn thành.
- Customer chưa đánh giá Trip.

**Luồng chính:**

1. Customer mở Trip đã hoàn thành.
2. Customer chọn chức năng đánh giá.
3. Customer nhập Rating.
4. Hệ thống kiểm tra dữ liệu.
5. Hệ thống lưu Rating.
6. Hệ thống thông báo đánh giá thành công.

**Ngoại lệ:**

- Trip chưa hoàn thành → không cho phép đánh giá.
- Trip đã được đánh giá → không cho phép tạo đánh giá mới.

### 5.20. UC-20 – Quản lý Customer

**Actor:** Admin

**Mục tiêu:** Quản lý thông tin Customer.

**Tiền điều kiện:**

- Admin đã đăng nhập.

**Luồng chính:**

1. Admin mở danh sách Customer.
2. Hệ thống hiển thị danh sách.
3. Admin xem thông tin Customer.
4. Admin thực hiện thao tác quản lý được phép.
5. Hệ thống kiểm tra và lưu thay đổi.

### 5.21. UC-21 – Quản lý Driver

**Actor:** Admin

**Mục tiêu:** Quản lý thông tin Driver.

**Tiền điều kiện:**

- Admin đã đăng nhập.

**Luồng chính:**

1. Admin mở danh sách Driver.
2. Hệ thống hiển thị danh sách.
3. Admin xem thông tin Driver.
4. Admin thực hiện thao tác quản lý được phép.
5. Hệ thống kiểm tra và lưu thay đổi.

### 5.22. UC-22 – Theo dõi Booking và Trip

**Actor:** Admin

**Mục tiêu:** Theo dõi hoạt động Booking và Trip.

**Tiền điều kiện:**

- Admin đã đăng nhập.

**Luồng chính:**

1. Admin mở chức năng theo dõi.
2. Hệ thống hiển thị danh sách Booking và Trip.
3. Admin xem trạng thái và thông tin liên quan.
4. Admin xác định các trường hợp cần hỗ trợ.
5. Admin thực hiện xử lý trong phạm vi được phép.

### 5.23. UC-23 – Xem thông báo

**Actor:** Customer, Driver

**Mục tiêu:** Xem thông báo về các sự kiện Booking, Trip, Payment.

**Tiền điều kiện:**

- Người dùng đã đăng nhập.

**Luồng chính:**

1. Người dùng mở danh sách thông báo.
2. Hệ thống lấy danh sách thông báo của người dùng.
3. Hệ thống hiển thị danh sách.
4. Người dùng chọn thông báo để đánh dấu đã đọc.
5. Hệ thống cập nhật trạng thái đã đọc.

## 6. Mapping Business Requirements và Use Cases

| Business Requirement                  | Use Cases                         |
| ------------------------------------- | --------------------------------- |
| BR-01 – Đặt xe trực tuyến             | UC-04, UC-05, UC-06, UC-07        |
| BR-02 – Tìm kiếm Driver               | UC-08, UC-10                      |
| BR-03 – Tiếp nhận Booking             | UC-09                             |
| BR-04 – Quản lý Trip                  | UC-11, UC-12, UC-13, UC-14        |
| BR-05 – Quản lý Customer              | UC-01, UC-02, UC-03, UC-20        |
| BR-06 – Quản lý Driver và Vehicle     | UC-02, UC-03, UC-15, UC-16, UC-21 |
| BR-07 – Thanh toán                    | UC-17, UC-18                      |
| BR-08 – Đánh giá Driver               | UC-19                             |
| BR-09 – Quản lý và theo dõi hoạt động | UC-20, UC-21, UC-22               |
| BR-10 – Xử lý trường hợp phát sinh    | UC-06, UC-10, UC-17, UC-22, UC-23        |

## 7. Mapping Functional Requirements và Use Cases

| Functional Requirement                  | Use Case     |
| --------------------------------------- | ------------ |
| FR-01 – Đăng ký tài khoản Customer      | UC-01        |
| FR-02 – Đăng nhập                       | UC-02        |
| FR-03 – Quản lý thông tin cá nhân       | UC-03        |
| FR-04 – Tạo Booking                     | UC-04        |
| FR-05 – Xem trạng thái Booking          | UC-05        |
| FR-06 – Hủy Booking                     | UC-06        |
| FR-07 – Xem lịch sử Booking             | UC-07        |
| FR-08 – Tìm Driver phù hợp              | UC-08        |
| FR-09 – Gửi Booking cho Driver          | UC-08        |
| FR-10 – Driver phản hồi Booking         | UC-09        |
| FR-11 – Tìm Driver thay thế             | UC-10        |
| FR-12 – Thông báo không tìm được Driver | UC-10        |
| FR-13 – Tạo Trip                        | UC-09        |
| FR-14 – Cập nhật trạng thái Trip        | UC-12        |
| FR-15 – Theo dõi Trip                   | UC-11        |
| FR-16 – Hoàn thành Trip                 | UC-13        |
| FR-17 – Xem lịch sử Trip                | UC-14        |
| FR-18 – Quản lý Vehicle cá nhân         | UC-15        |
| FR-19 – Quản lý Vehicle                 | UC-16        |
| FR-20 – Tạo Payment                     | UC-13, UC-17 |
| FR-21 – Thanh toán                      | UC-17        |
| FR-22 – Cập nhật kết quả Payment        | UC-17        |
| FR-23 – Thông báo kết quả Payment       | UC-17, UC-18 |
| FR-24 – Đánh giá Driver                 | UC-19        |
| FR-25 – Xem Rating                      | UC-19        |
| FR-26 – Quản lý Customer                | UC-20        |
| FR-27 – Quản lý Driver                  | UC-21        |
| FR-28 – Theo dõi Booking và Trip        | UC-22        |
| FR-29 – Xem thông báo | UC-23 |
