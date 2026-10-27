# Create Admin

Script này tạo hoặc cập nhật tài khoản `ADMIN` trong `auth_db`. Password chỉ
được truyền qua environment và được lưu dưới dạng bcrypt hash.

## Chạy trong Docker Compose

Build lại Auth Service sau khi thêm script:

```powershell
docker compose build auth-service
docker compose up -d auth-service
```

Chạy script bằng credential tạm thời, không ghi password vào file:

```powershell
$env:ADMIN_EMAIL = "admin@cabsystem.local"
$env:ADMIN_PASSWORD = "<strong-password>"
docker compose exec -e ADMIN_EMAIL -e ADMIN_PASSWORD auth-service node scripts/createAdmin.js
Remove-Item Env:ADMIN_EMAIL
Remove-Item Env:ADMIN_PASSWORD
```

Kết quả thành công có dạng:

```text
Admin ready: id=..., email=admin@cabsystem.local, role=ADMIN, status=ACTIVE
```

Nếu email đã tồn tại, script sẽ cập nhật password, role thành `ADMIN` và
status thành `ACTIVE`. Script không in password và không lưu password plaintext
vào source code.

## Chạy trực tiếp trên host

Khi chạy ngoài Docker, cần đặt `DATABASE_URL` trỏ tới `auth_db` và các package
đã cài trong `services/auth-service`:

```powershell
$env:DATABASE_URL = "postgresql://<user>:<password>@localhost:5432/auth_db"
$env:ADMIN_EMAIL = "admin@cabsystem.local"
$env:ADMIN_PASSWORD = "<strong-password>"
node scripts/createAdmin.js
```
