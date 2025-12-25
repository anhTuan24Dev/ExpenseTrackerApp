# Tài liệu Test API User Management với Postman

## Thông tin cơ bản

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **Yêu cầu**: Tất cả các API đều cần Bearer Token (lấy từ API đăng nhập)

---

## 1. Lấy thông tin người dùng (Get User)

### Endpoint
```
GET /api/user/get-user
```

### Headers
```
Authorization: Bearer <token>
```

### Response thành công (200)
```json
{
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "Nguyễn",
      "lastName": "Văn A",
      "contact": "0123456789",
      "country": "Việt Nam",
      "currency": "VND",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Lấy thông tin người dùng thành công",
  "success": true
}
```

### Response lỗi (401)
```json
{
  "message": "Không tìm thấy token xác thực. Vui lòng đăng nhập.",
  "success": false
}
```

### Response lỗi (404)
```json
{
  "message": "Không tìm thấy thông tin người dùng",
  "success": false
}
```

---

## 2. Đổi mật khẩu (Change Password)

### Endpoint
```
POST /api/user/change-password
```

### Headers
```
Authorization: Bearer <token>
```

### Request Body
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

### Response thành công (200)
```json
{
  "message": "Đổi mật khẩu thành công",
  "success": true
}
```

### Response lỗi (400)
```json
{
  "message": "Vui lòng điền đầy đủ mật khẩu cũ và mật khẩu mới",
  "success": false
}
```

```json
{
  "message": "Mật khẩu mới phải có ít nhất 6 ký tự",
  "success": false
}
```

```json
{
  "message": "Mật khẩu mới không được trùng với mật khẩu cũ",
  "success": false
}
```

### Response lỗi (401)
```json
{
  "message": "Mật khẩu cũ không đúng",
  "success": false
}
```

---

## 3. Cập nhật thông tin người dùng (Update User)

### Endpoint
```
PUT /api/user/update-user
```

### Headers
```
Authorization: Bearer <token>
```

### Request Body
```json
{
  "firstName": "Trần",
  "lastName": "Thị B",
  "country": "Việt Nam",
  "currency": "USD",
  "contact": "0987654321"
}
```

**Lưu ý**: Có thể cập nhật một hoặc nhiều trường cùng lúc. Không thể cập nhật email.

### Response thành công (200)
```json
{
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "Trần",
      "lastName": "Thị B",
      "contact": "0987654321",
      "country": "Việt Nam",
      "currency": "USD",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  },
  "message": "Cập nhật thông tin người dùng thành công",
  "success": true
}
```

### Response lỗi (400)
```json
{
  "message": "Vui lòng cung cấp ít nhất một trường để cập nhật",
  "success": false
}
```

```json
{
  "message": "Không thể thay đổi email",
  "success": false
}
```

### Response lỗi (401)
```json
{
  "message": "Không tìm thấy token xác thực. Vui lòng đăng nhập.",
  "success": false
}
```

### Response lỗi (404)
```json
{
  "message": "Không tìm thấy thông tin người dùng",
  "success": false
}
```

---

## Hướng dẫn sử dụng Postman

### 1. Tạo Collection mới
- Mở Postman → New → Collection
- Đặt tên: `Expense Tracker API - User`

### 2. Thiết lập Environment Variables
- Tạo Environment mới: `Local Development`
- Thêm biến: `base_url` = `http://localhost:3000`
- Thêm biến: `auth_token` = `<token từ API đăng nhập>`

### 3. Sử dụng Token cho các API được bảo vệ
- Chọn tab **Authorization**
- Chọn type: **Bearer Token**
- Dán token vào ô **Token** hoặc sử dụng `{{auth_token}}`

### 4. Test Lấy thông tin người dùng
1. Tạo request mới: `GET {{base_url}}/api/user/get-user`
2. Chọn tab **Authorization** → **Bearer Token**
3. Dán token vào ô **Token** (hoặc dùng `{{auth_token}}`)
4. Click **Send**

### 5. Test Đổi mật khẩu
1. Tạo request mới: `POST {{base_url}}/api/user/change-password`
2. Chọn tab **Authorization** → **Bearer Token**
3. Dán token vào ô **Token** (hoặc dùng `{{auth_token}}`)
4. Chọn tab **Body** → **raw** → **JSON**
5. Dán request body với oldPassword và newPassword
6. Click **Send**

### 6. Test Cập nhật thông tin người dùng
1. Tạo request mới: `PUT {{base_url}}/api/user/update-user`
2. Chọn tab **Authorization** → **Bearer Token**
3. Dán token vào ô **Token** (hoặc dùng `{{auth_token}}`)
4. Chọn tab **Body** → **raw** → **JSON**
5. Dán request body với các trường muốn cập nhật (firstName, lastName, country, currency, contact)
6. Click **Send**

---

## Lưu ý

- Tất cả các API `/api/user/*` đều yêu cầu xác thực bằng Bearer Token
- Token có thể lấy từ API đăng nhập (xem file `POSTMAN_API_TEST_AUTH.md`)
- Token có thời hạn 1 ngày
- Server phải đang chạy trên port 3000
- Không thể thay đổi email thông qua API cập nhật thông tin người dùng
- Khi đổi mật khẩu, mật khẩu mới không được trùng với mật khẩu cũ
- Có thể cập nhật một hoặc nhiều trường cùng lúc trong API update-user

