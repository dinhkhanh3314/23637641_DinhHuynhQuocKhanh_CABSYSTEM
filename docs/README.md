# CABSystem

## 1. Mục đích

CABSystem là hệ thống hỗ trợ đặt xe trực tuyến cho công ty ABC, nhằm thay thế và cải thiện một số hạn chế của quy trình đặt xe hiện tại.

Hệ thống hỗ trợ khách hàng đặt xe, tìm kiếm và phân công tài xế, theo dõi chuyến đi, thanh toán và đánh giá. Đồng thời, hệ thống hỗ trợ tài xế quản lý hoạt động và hỗ trợ Admin theo dõi, quản lý các hoạt động vận hành.

## 2. Bối cảnh hệ thống

Hiện tại, khách hàng có thể liên hệ tổng đài hoặc sử dụng một ứng dụng đơn giản để yêu cầu xe. Tuy nhiên, hệ thống hiện tại còn một số hạn chế:

- Việc tìm kiếm và phân công tài xế còn thủ công.
- Khách hàng khó theo dõi trạng thái chuyến đi.
- Quy trình thanh toán chưa được tập trung.
- Việc quản lý hoạt động của tài xế còn hạn chế.
- Hệ thống khó mở rộng khi số lượng người dùng và chuyến đi tăng.

CABSystem được xây dựng nhằm hỗ trợ tự động hóa các hoạt động trên và cung cấp một quy trình đặt xe thống nhất.

## 3. Phạm vi hệ thống

CABSystem tập trung vào các chức năng chính:

- Quản lý tài khoản Customer, Driver và Admin.
- Quản lý thông tin Vehicle.
- Đặt xe.
- Tìm kiếm và phân công Driver.
- Theo dõi và quản lý Trip.
- Thanh toán.
- Đánh giá Driver.
- Quản lý và theo dõi hoạt động vận hành.

Chi tiết phạm vi được trình bày tại [Project Scope](docs/requirements/project-scope.md).

## 4. Đối tượng sử dụng

Hệ thống có ba actor chính:

- **Customer:** đặt xe, theo dõi chuyến, thanh toán và đánh giá.
- **Driver:** quản lý thông tin, Vehicle, trạng thái hoạt động, nhận và thực hiện chuyến.
- **Admin:** quản lý Customer, Driver, Vehicle và theo dõi hoạt động của hệ thống.

Các stakeholder khác như Ban giám đốc, nhà cung cấp thanh toán và nhà cung cấp thông báo được trình bày tại [Stakeholders](docs/requirements/stakeholders.md).

## 5. Quy trình nghiệp vụ tổng quát

Quy trình đặt xe chính:

```text
Customer
   ↓
Tạo Booking
   ↓
Hệ thống tìm Driver phù hợp
   ↓
Gửi Booking cho Driver
   ↓
Driver chấp nhận / từ chối
   ↓
Nếu từ chối hoặc không phản hồi
   → Tìm Driver khác
   ↓
Driver nhận chuyến
   ↓
Thực hiện Trip
   ↓
Hoàn thành Trip
   ↓
Thanh toán
   ↓
Customer đánh giá
```

## 6. Các yêu cầu chính

### 6.1. Yêu cầu nghiệp vụ

Các yêu cầu nghiệp vụ chính bao gồm:

- Cung cấp chức năng đặt xe trực tuyến.
- Tự động hỗ trợ tìm kiếm và phân công Driver.
- Xử lý trường hợp Driver từ chối hoặc không phản hồi.
- Quản lý quá trình thực hiện Trip.
- Quản lý Customer, Driver và Vehicle.
- Hỗ trợ thanh toán.
- Hỗ trợ đánh giá sau chuyến đi.
- Hỗ trợ Admin theo dõi và quản lý hoạt động vận hành.

Chi tiết tại [Business Requirements](docs/requirements/business-requirements.md).

### 6.2. Yêu cầu chức năng

Các yêu cầu chức năng được chia theo các nhóm:

- Quản lý tài khoản.
- Quản lý Customer.
- Quản lý Driver.
- Quản lý Vehicle.
- Quản lý Booking.
- Tìm kiếm và phân công Driver.
- Quản lý Trip.
- Thanh toán.
- Đánh giá.
- Quản lý vận hành.

Chi tiết tại [Functional Requirements](docs/requirements/functional-requirements.md).

### 6.3. Yêu cầu phi chức năng

Hệ thống cần đáp ứng các yêu cầu liên quan đến:

- Hiệu năng.
- Bảo mật.
- Phân quyền.
- Bảo vệ dữ liệu cá nhân.
- Khả năng xử lý nhiều yêu cầu đồng thời.
- Khả năng bảo trì và mở rộng.
- Xử lý lỗi đối với các dịch vụ bên ngoài.

Chi tiết tại [Non-functional Requirements](docs/requirements/non-functional-requirements.md).

## 7. Use Case

Các Use Case được xác định dựa trên ba actor chính:

- Customer
- Driver
- Admin

Use Case Diagram tổng quát được lưu tại:

`docs/diagrams/use-case/`

Danh sách Use Case được trình bày tại [Use Cases](docs/requirements/use-cases.md).

Đặc tả chi tiết từng Use Case được trình bày tại [Use Case Specifications](docs/requirements/use-case-specifications.md).

## 8. Business Rules và trạng thái hệ thống

Một số quy tắc nghiệp vụ chính:

- Booking phải được xử lý trước khi Trip được thực hiện.
- Driver phải phù hợp với yêu cầu của Booking.
- Driver không ở trạng thái hoạt động không được phân công chuyến.
- Nếu Driver từ chối hoặc không phản hồi, hệ thống có thể tìm Driver khác.
- Chỉ Driver được phân công mới được thực hiện Trip.
- Trip chỉ được chuyển sang trạng thái hoàn thành khi chuyến đi kết thúc.
- Customer chỉ được đánh giá sau khi Trip hoàn thành.
- Payment được thực hiện sau khi Trip hoàn thành.

Chi tiết tại [Business Rules](docs/requirements/business-rules.md).

## 9. Diagrams

Các sơ đồ của hệ thống được tổ chức theo các nhóm:

- Use Case Diagram
- Activity Diagram
- Sequence Diagram
- Domain Diagram

Các sơ đồ được lưu tại:

`docs/diagrams/`

## 10. API

API được xây dựng theo kiến trúc RESTful API.

Tài liệu API được lưu tại:

[API Documentation](docs/api/api-docs.md)

## 11. Testing

Quá trình kiểm thử bao gồm:

- Xây dựng Test Plan.
- Xây dựng Test Cases.
- Kiểm thử các chức năng chính.
- Kiểm thử các trường hợp lỗi.
- Kiểm thử API.

Chi tiết tại:

- [Test Plan](docs/testing/test-plan.md)
- [Test Cases](docs/testing/test-cases.md)

## 12. Quy trình phát triển

Dự án được thực hiện theo hai giai đoạn chính:

### Phase 1 – Phân tích nghiệp vụ và đặc tả

- Phân tích hệ thống.
- Xác định Stakeholder.
- Xác định mục tiêu nghiệp vụ.
- Xác định phạm vi.
- Xác định Business Requirements.
- Xác định Functional Requirements.
- Xây dựng Use Case.
- Đặc tả Use Case.
- Phân tích Business Process.
- Phân tích Business Rules.
- Xây dựng các sơ đồ cần thiết.

### Phase 2 – Phát triển hệ thống

- Thiết kế cơ sở dữ liệu.
- Xây dựng RESTful API.
- Phát triển các chức năng.
- Kiểm thử.
- Docker hóa hệ thống.
- Triển khai hệ thống.

## 13. Thông tin dự án

**Project:** CABSystem  
**Organization:** ABC  
**Project Duration:** 7 tuần  
**System Type:** Online Ride Booking System
