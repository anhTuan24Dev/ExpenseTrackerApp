# Tài liệu Test API với Postman

## Tổng quan

Tài liệu này được chia thành 2 phần riêng biệt để dễ quản lý và sử dụng:

1. **[POSTMAN_API_TEST_AUTH.md](./POSTMAN_API_TEST_AUTH.md)** - API Authentication (Đăng ký, Đăng nhập)
2. **[POSTMAN_API_TEST_USER.md](./POSTMAN_API_TEST_USER.md)** - API User Management (Lấy thông tin, Đổi mật khẩu, Cập nhật thông tin)

---

## Thông tin cơ bản

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`

---

## Danh sách API

### Authentication APIs
- `POST /api/auth/sign-up` - Đăng ký tài khoản mới
- `POST /api/auth/sign-in` - Đăng nhập và lấy token

**Xem chi tiết**: [POSTMAN_API_TEST_AUTH.md](./POSTMAN_API_TEST_AUTH.md)

### User Management APIs
- `GET /api/user/get-user` - Lấy thông tin người dùng (yêu cầu token)
- `POST /api/user/change-password` - Đổi mật khẩu (yêu cầu token)
- `PUT /api/user/update-user` - Cập nhật thông tin người dùng (yêu cầu token)

**Xem chi tiết**: [POSTMAN_API_TEST_USER.md](./POSTMAN_API_TEST_USER.md)

---

## Quick Start

1. **Đăng ký tài khoản mới**: Sử dụng API `POST /api/auth/sign-up`
2. **Đăng nhập**: Sử dụng API `POST /api/auth/sign-in` để lấy token
3. **Sử dụng token**: Dùng token để gọi các API User Management

---

## Lưu ý chung

- Mật khẩu phải có ít nhất 6 ký tự
- Email phải đúng định dạng
- Token có thời hạn 1 ngày
- Server phải đang chạy trên port 3000
- Các API `/api/user/*` đều yêu cầu xác thực bằng Bearer Token


