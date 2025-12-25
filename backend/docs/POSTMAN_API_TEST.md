# Tài liệu Test API với Postman

## Tổng quan

Tài liệu này được chia thành 3 phần riêng biệt để dễ quản lý và sử dụng:

1. **[POSTMAN_API_TEST_AUTH.md](./POSTMAN_API_TEST_AUTH.md)** - API Authentication (Đăng ký, Đăng nhập)
2. **[POSTMAN_API_TEST_USER.md](./POSTMAN_API_TEST_USER.md)** - API User Management (Lấy thông tin, Đổi mật khẩu, Cập nhật thông tin)
3. **[POSTMAN_API_TEST_ACCOUNT.md](./POSTMAN_API_TEST_ACCOUNT.md)** - API Account Management (Tạo tài khoản, Lấy danh sách, Nạp tiền)

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

### Account Management APIs
- `POST /api/account/create-account` - Tạo tài khoản mới (yêu cầu token)
- `GET /api/account/get-accounts` - Lấy danh sách tài khoản (yêu cầu token)
- `POST /api/account/add-money` - Nạp tiền vào tài khoản (yêu cầu token)

**Xem chi tiết**: [POSTMAN_API_TEST_ACCOUNT.md](./POSTMAN_API_TEST_ACCOUNT.md)

---

## Quick Start

1. **Đăng ký tài khoản mới**: Sử dụng API `POST /api/auth/sign-up`
2. **Đăng nhập**: Sử dụng API `POST /api/auth/sign-in` để lấy token
3. **Sử dụng token**: Dùng token để gọi các API User Management và Account Management
4. **Tạo tài khoản**: Sử dụng API `POST /api/account/create-account` để tạo ví tiền/tài khoản ngân hàng
5. **Nạp tiền**: Sử dụng API `POST /api/account/add-money` để nạp tiền vào tài khoản

---

## Lưu ý chung

- Mật khẩu phải có ít nhất 6 ký tự
- Email phải đúng định dạng
- Token có thời hạn 1 ngày
- Server phải đang chạy trên port 3000
- Các API `/api/user/*` và `/api/account/*` đều yêu cầu xác thực bằng Bearer Token
- Không thể tạo 2 tài khoản trùng tên cho cùng một user


