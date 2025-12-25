# Tài liệu Test API với Postman

## Thông tin cơ bản

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`

---

## 1. Đăng ký (Sign Up)

### Endpoint
```
POST /api/auth/sign-up
```

### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Nguyễn",
  "lastName": "Văn A"
}
```

### Response thành công (201)
```json
{
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "Nguyễn",
      "lastName": "Văn A",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Đăng ký thành công",
  "success": true
}
```

### Response lỗi (400/409)
```json
{
  "message": "Email đã tồn tại trong hệ thống",
  "success": false
}
```

---

## 2. Đăng nhập (Sign In)

### Endpoint
```
POST /api/auth/sign-in
```

### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Response thành công (200)
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "Nguyễn",
      "lastName": "Văn A"
    }
  },
  "message": "Đăng nhập thành công",
  "success": true
}
```

### Response lỗi (401)
```json
{
  "message": "Email hoặc mật khẩu không đúng",
  "success": false
}
```

---

## Hướng dẫn sử dụng Postman

### 1. Tạo Collection mới
- Mở Postman → New → Collection
- Đặt tên: `Expense Tracker API`

### 2. Thiết lập Environment Variables (Tùy chọn)
- Tạo Environment mới: `Local Development`
- Thêm biến: `base_url` = `http://localhost:3000`

### 3. Test Đăng ký
1. Tạo request mới: `POST {{base_url}}/api/auth/sign-up`
2. Chọn tab **Body** → **raw** → **JSON**
3. Dán request body ở trên
4. Click **Send**

### 4. Test Đăng nhập
1. Tạo request mới: `POST {{base_url}}/api/auth/sign-in`
2. Chọn tab **Body** → **raw** → **JSON**
3. Dán request body ở trên
4. Click **Send**
5. Copy `token` từ response để sử dụng cho các API cần xác thực

### 5. Sử dụng Token cho các API được bảo vệ
- Chọn tab **Authorization**
- Chọn type: **Bearer Token**
- Dán token đã copy vào ô **Token**

---

## Lưu ý

- Mật khẩu phải có ít nhất 6 ký tự
- Email phải đúng định dạng
- Token có thời hạn 1 ngày
- Server phải đang chạy trên port 3000

