# Tài liệu Test API Account Management với Postman

## Thông tin cơ bản

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **Yêu cầu**: Tất cả các API đều cần Bearer Token (lấy từ API đăng nhập)

---

## 1. Tạo tài khoản mới (Create Account)

### Endpoint
```
POST /api/account/create-account
```

### Headers
```
Authorization: Bearer <token>
```

### Request Body
```json
{
  "accountName": "Visa",
  "initialBalance": 1000000
}
```

**Lưu ý**: 
- `accountName` là bắt buộc (VD: "Visa", "Cash", "Tiền mặt")
- `initialBalance` là tùy chọn, mặc định là 0 nếu không cung cấp
- Nếu có `initialBalance`, hệ thống sẽ tự động tạo transaction "Initial Deposit"

### Response thành công (201)
```json
{
  "data": {
    "account": {
      "id": 1,
      "user_id": 1,
      "account_name": "Visa",
      "account_number": "ACC11704123456789",
      "account_balance": "1000000.00",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Tạo tài khoản thành công",
  "success": true
}
```

### Response lỗi (400)
```json
{
  "message": "Vui lòng nhập tên tài khoản",
  "success": false
}
```

```json
{
  "message": "Số dư ban đầu phải là số không âm",
  "success": false
}
```

### Response lỗi (409)
```json
{
  "message": "Bạn đã có tài khoản với tên này rồi",
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

---

## 2. Lấy danh sách tài khoản (Get Accounts)

### Endpoint
```
GET /api/account/get-accounts
```

### Headers
```
Authorization: Bearer <token>
```

### Response thành công (200)
```json
{
  "data": {
    "accounts": [
      {
        "id": 1,
        "user_id": 1,
        "account_name": "Visa",
        "account_number": "ACC11704123456789",
        "account_balance": "1000000.00",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "user_id": 1,
        "account_name": "Cash",
        "account_number": "ACC11704123456790",
        "account_balance": "500000.00",
        "createdAt": "2024-01-02T00:00:00.000Z",
        "updatedAt": "2024-01-02T00:00:00.000Z"
      }
    ],
    "total": 2
  },
  "message": "Lấy danh sách tài khoản thành công",
  "success": true
}
```

**Lưu ý**: Danh sách được sắp xếp theo thời gian tạo (mới nhất trước)

### Response lỗi (401)
```json
{
  "message": "Không tìm thấy token xác thực. Vui lòng đăng nhập.",
  "success": false
}
```

---

## 3. Nạp tiền vào tài khoản (Add Money)

### Endpoint
```
POST /api/account/add-money
```

### Headers
```
Authorization: Bearer <token>
```

### Request Body
```json
{
  "accountId": 1,
  "amount": 500000,
  "description": "Nạp tiền từ ngân hàng"
}
```

**Lưu ý**: 
- `accountId` là bắt buộc (ID của tài khoản cần nạp tiền)
- `amount` là bắt buộc và phải là số dương
- `description` là tùy chọn, nếu không cung cấp sẽ dùng mô tả mặc định

### Response thành công (200)
```json
{
  "data": {
    "account": {
      "id": 1,
      "user_id": 1,
      "account_name": "Visa",
      "account_number": "ACC11704123456789",
      "account_balance": "1500000.00",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-03T00:00:00.000Z"
    }
  },
  "message": "Nạp tiền thành công",
  "success": true
}
```

### Response lỗi (400)
```json
{
  "message": "Vui lòng cung cấp ID tài khoản",
  "success": false
}
```

```json
{
  "message": "Số tiền nạp phải là số dương",
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
  "message": "Không tìm thấy tài khoản hoặc tài khoản không thuộc về bạn",
  "success": false
}
```

---

## Hướng dẫn sử dụng Postman

### 1. Tạo Collection mới
- Mở Postman → New → Collection
- Đặt tên: `Expense Tracker API - Account`

### 2. Thiết lập Environment Variables
- Tạo Environment mới: `Local Development`
- Thêm biến: `base_url` = `http://localhost:3000`
- Thêm biến: `auth_token` = `<token từ API đăng nhập>`

### 3. Sử dụng Token cho các API được bảo vệ
- Chọn tab **Authorization**
- Chọn type: **Bearer Token**
- Dán token vào ô **Token** hoặc sử dụng `{{auth_token}}`

### 4. Test Tạo tài khoản mới
1. Tạo request mới: `POST {{base_url}}/api/account/create-account`
2. Chọn tab **Authorization** → **Bearer Token**
3. Dán token vào ô **Token** (hoặc dùng `{{auth_token}}`)
4. Chọn tab **Body** → **raw** → **JSON**
5. Dán request body với `accountName` và `initialBalance` (tùy chọn)
6. Click **Send**
7. Lưu `account.id` từ response để sử dụng cho API nạp tiền

### 5. Test Lấy danh sách tài khoản
1. Tạo request mới: `GET {{base_url}}/api/account/get-accounts`
2. Chọn tab **Authorization** → **Bearer Token**
3. Dán token vào ô **Token** (hoặc dùng `{{auth_token}}`)
4. Click **Send**

### 6. Test Nạp tiền vào tài khoản
1. Tạo request mới: `POST {{base_url}}/api/account/add-money`
2. Chọn tab **Authorization** → **Bearer Token**
3. Dán token vào ô **Token** (hoặc dùng `{{auth_token}}`)
4. Chọn tab **Body** → **raw** → **JSON**
5. Dán request body với `accountId`, `amount` và `description` (tùy chọn)
6. Click **Send**

### 7. Lưu Account ID vào Environment Variable (Tùy chọn)
- Sau khi tạo tài khoản thành công, copy `account.id` từ response
- Thêm biến vào Environment: `account_id` = `<account id đã copy>`
- Sử dụng `{{account_id}}` trong các request khác

---

## Quy trình test đầy đủ

### Bước 1: Đăng nhập để lấy token
- Sử dụng API `POST /api/auth/sign-in` (xem file `POSTMAN_API_TEST_AUTH.md`)
- Copy token từ response

### Bước 2: Tạo tài khoản mới
- Sử dụng API `POST /api/account/create-account`
- Nhập tên tài khoản (VD: "Visa", "Cash")
- Nhập số dư ban đầu (tùy chọn)
- Lưu `account.id` từ response

### Bước 3: Lấy danh sách tài khoản
- Sử dụng API `GET /api/account/get-accounts`
- Kiểm tra tài khoản vừa tạo có trong danh sách

### Bước 4: Nạp tiền vào tài khoản
- Sử dụng API `POST /api/account/add-money`
- Nhập `accountId` (từ bước 2)
- Nhập số tiền cần nạp
- Kiểm tra số dư đã được cập nhật

### Bước 5: Kiểm tra lại danh sách tài khoản
- Sử dụng lại API `GET /api/account/get-accounts`
- Xác nhận số dư đã được cập nhật đúng

---

## Lưu ý

- Tất cả các API `/api/account/*` đều yêu cầu xác thực bằng Bearer Token
- Token có thể lấy từ API đăng nhập (xem file `POSTMAN_API_TEST_AUTH.md`)
- Token có thời hạn 1 ngày
- Server phải đang chạy trên port 3000
- Không thể tạo 2 tài khoản trùng tên cho cùng một user
- Khi tạo tài khoản có số dư ban đầu, hệ thống tự động tạo transaction "Initial Deposit"
- Khi nạp tiền, hệ thống tự động ghi lại transaction vào lịch sử
- Số tài khoản (`account_number`) được tự động tạo dựa trên userId và timestamp
- Mỗi user chỉ có thể nạp tiền vào tài khoản của chính mình

---

## Ví dụ Request Body

### Tạo tài khoản không có số dư ban đầu
```json
{
  "accountName": "Tiền mặt"
}
```

### Tạo tài khoản có số dư ban đầu
```json
{
  "accountName": "Visa",
  "initialBalance": 2000000
}
```

### Nạp tiền với mô tả tùy chỉnh
```json
{
  "accountId": 1,
  "amount": 1000000,
  "description": "Nhận lương tháng 1"
}
```

### Nạp tiền không có mô tả (sử dụng mô tả mặc định)
```json
{
  "accountId": 1,
  "amount": 500000
}
```

