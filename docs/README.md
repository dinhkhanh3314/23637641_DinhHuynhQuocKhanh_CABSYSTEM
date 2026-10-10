# CAB System Documentation

Tài liệu trong thư mục này mô tả kiến trúc, yêu cầu, API, tích hợp và bảo mật
của CAB System.

## Tài liệu chính

| Nội dung                   | Tài liệu                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------ |
| Kiến trúc microservice     | [Thiết kế kiến trúc CAB System](architecture/CABSystem_Microservice_Architecture.md) |
| Tổng quan và yêu cầu       | [Tài liệu yêu cầu hệ thống](requirements/)                                           |
| API Gateway                | [Đặc tả API Gateway](api/api_docs.yaml)                                              |
| Chạy Compose và smoke test | [Hướng dẫn tích hợp và Docker Compose](integration/README.md)                        |
| Kafka và event             | [Tài liệu Kafka và event](kafka/README.md)                                           |
| Security                   | [Tài liệu bảo mật](security/README.md)                                               |

## Runtime hiện tại

Client/Postman chỉ gọi API Gateway:

```text
http://localhost:3000
```

Gateway gọi microservice bằng gRPC trong mạng Docker Compose. Kafka được dùng
cho event bất đồng bộ và Notification Service.

Khởi động toàn bộ stack:

```powershell
docker compose up -d --build
docker compose ps
```

Kiểm tra:

```powershell
curl.exe http://localhost:3000/health
curl.exe http://localhost:3000/ready
curl.exe http://localhost:3000/health/services
```

Các container `postgres-init` và `*-migrate` là job khởi tạo. Trạng thái
`Exited (0)` sau khi hoàn thành là bình thường.

## Quy tắc đọc tài liệu

- Các ví dụ API dùng port Gateway `3000`, không dùng port HTTP nội bộ của
  microservice cho luồng demo.
- Các địa chỉ `localhost` trong biến môi trường là dành cho chạy service trực
  tiếp trên máy host. Khi chạy trong Compose, service dùng hostname Docker như
  `postgres`, `mongodb`, `redis`, `kafka` và `trip-service`.
- Những phần ghi `Chưa xác minh` hoặc `Giới hạn hiện tại` không được xem là
  chức năng đã kiểm thử thành công.
- Không đưa credential, JWT secret, webhook secret hoặc password thật vào tài
  liệu và ảnh chụp demo.
