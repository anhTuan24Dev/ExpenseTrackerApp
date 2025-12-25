# Tài liệu Test API Transaction Management với Postman

## Thông tin cơ bản

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`
- **Yêu cầu**: Tất cả các API đều cần Bearer Token (lấy từ API đăng nhập)

---

## 1. Thêm giao dịch (Add Transaction)

### Endpoint
```
POST /api/transaction/add-transaction
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
  "description": "Mua sắm tại siêu thị",
  "type": "expense"
}
```

**Lưu ý**: 
- `accountId` là bắt buộc (ID của tài khoản thực hiện giao dịch)
- `amount` là bắt buộc và phải là số dương
- `type` là bắt buộc, chỉ nhận giá trị `"income"` (thu nhập) hoặc `"expense"` (chi tiêu)
- `description` là tùy chọn, nếu không cung cấp sẽ dùng mô tả mặc định
- **Kiểm tra số dư**: Nếu `type` là `"expense"`, hệ thống sẽ kiểm tra số dư tài khoản. Nếu số dư < 0 hoặc < số tiền chi tiêu → trả về lỗi "Insufficient balance"
- **SQL Transaction**: Hệ thống sử dụng SQL Transaction để đảm bảo tính nhất quán dữ liệu. Nếu cập nhật số dư hoặc thêm giao dịch thất bại, toàn bộ transaction sẽ được ROLLBACK

### Response thành công (201) - Thu nhập
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
    },
    "transaction": {
      "id": 1,
      "user_id": 1,
      "description": "Thu nhập từ tài khoản Visa",
      "status": "Completed",
      "source": "1",
      "amount": "500000.00",
      "type": "income",
      "createdAt": "2024-01-03T00:00:00.000Z",
      "updatedAt": "2024-01-03T00:00:00.000Z"
    }
  },
  "message": "Thêm giao dịch thu nhập thành công",
  "success": true
}
```

### Response thành công (201) - Chi tiêu
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
      "updatedAt": "2024-01-03T00:00:00.000Z"
    },
    "transaction": {
      "id": 2,
      "user_id": 1,
      "description": "Mua sắm tại siêu thị",
      "status": "Completed",
      "source": "1",
      "amount": "500000.00",
      "type": "expense",
      "createdAt": "2024-01-03T00:00:00.000Z",
      "updatedAt": "2024-01-03T00:00:00.000Z"
    }
  },
  "message": "Thêm giao dịch chi tiêu thành công",
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
  "message": "Số tiền phải là số dương",
  "success": false
}
```

```json
{
  "message": "Loại giao dịch phải là 'income' hoặc 'expense'",
  "success": false
}
```

```json
{
  "message": "Insufficient balance",
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

## 2. Chuyển tiền giữa các tài khoản (Transfer Money)

### Endpoint
```
POST /api/transaction/transfer-money
```

### Headers
```
Authorization: Bearer <token>
```

### Request Body
```json
{
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": 300000,
  "description": "Chuyển tiền từ Visa sang Tiền mặt"
}
```

**Lưu ý**: 
- `fromAccountId` là bắt buộc (ID của tài khoản nguồn)
- `toAccountId` là bắt buộc (ID của tài khoản đích)
- `amount` là bắt buộc và phải là số dương
- `description` là tùy chọn, nếu không cung cấp sẽ dùng mô tả mặc định
- Tài khoản nguồn và tài khoản đích không thể giống nhau
- **Kiểm tra số dư**: Hệ thống sẽ kiểm tra số dư tài khoản nguồn. Nếu số dư < 0 hoặc < số tiền chuyển → trả về lỗi "Insufficient balance"
- **SQL Transaction**: Hệ thống thực hiện các bước sau trong một SQL Transaction:
  1. Trừ tiền từ tài khoản nguồn
  2. Cộng tiền vào tài khoản đích
  3. Ghi nhận giao dịch "Expense" cho tài khoản nguồn
  4. Ghi nhận giao dịch "Income" cho tài khoản đích
- **Tổng tài sản không đổi**: Logic này đảm bảo tổng tài sản của người dùng không đổi, chỉ dịch chuyển từ ví này sang ví khác

### Response thành công (200)
```json
{
  "data": {
    "expenseTransaction": {
      "id": 3,
      "user_id": 1,
      "description": "Chuyển tiền từ Visa sang Tiền mặt",
      "status": "Completed",
      "source": "1",
      "amount": "300000.00",
      "type": "expense",
      "createdAt": "2024-01-03T00:00:00.000Z",
      "updatedAt": "2024-01-03T00:00:00.000Z"
    },
    "fromAccount": {
      "id": 1,
      "user_id": 1,
      "account_name": "Visa",
      "account_number": "ACC11704123456789",
      "account_balance": "700000.00",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-03T00:00:00.000Z"
    },
    "incomeTransaction": {
      "id": 4,
      "user_id": 1,
      "description": "Chuyển tiền từ Visa sang Tiền mặt",
      "status": "Completed",
      "source": "2",
      "amount": "300000.00",
      "type": "income",
      "createdAt": "2024-01-03T00:00:00.000Z",
      "updatedAt": "2024-01-03T00:00:00.000Z"
    },
    "toAccount": {
      "id": 2,
      "user_id": 1,
      "account_name": "Tiền mặt",
      "account_number": "ACC11704123456790",
      "account_balance": "800000.00",
      "createdAt": "2024-01-02T00:00:00.000Z",
      "updatedAt": "2024-01-03T00:00:00.000Z"
    }
  },
  "message": "Chuyển tiền thành công",
  "success": true
}
```

### Response lỗi (400)
```json
{
  "message": "Vui lòng cung cấp ID tài khoản nguồn và tài khoản đích",
  "success": false
}
```

```json
{
  "message": "Tài khoản nguồn và tài khoản đích không thể giống nhau",
  "success": false
}
```

```json
{
  "message": "Số tiền chuyển phải là số dương",
  "success": false
}
```

```json
{
  "message": "Insufficient balance",
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
  "message": "Không tìm thấy tài khoản nguồn hoặc tài khoản không thuộc về bạn",
  "success": false
}
```

```json
{
  "message": "Không tìm thấy tài khoản đích hoặc tài khoản không thuộc về bạn",
  "success": false
}
```

---

## 3. Lấy dữ liệu Dashboard (Get Dashboard)

### Endpoint
```
GET /api/transaction/get-dashboard
```

### Headers
```
Authorization: Bearer <token>
```

### Response thành công (200)
```json
{
  "data": {
    "summary": {
      "totalIncome": 2000000,
      "totalExpense": 800000,
      "availableBalance": 1200000
    },
    "chartData": [
      {
        "month": 1,
        "year": 2024,
        "income": 1500000,
        "expense": 500000
      },
      {
        "month": 2,
        "year": 2024,
        "income": 500000,
        "expense": 300000
      }
    ]
  },
  "message": "Lấy dữ liệu dashboard thành công",
  "success": true
}
```

**Giải thích dữ liệu**:
- `summary.totalIncome`: Tổng thu nhập (tính bằng SUM và GROUP BY type = 'income')
- `summary.totalExpense`: Tổng chi tiêu (tính bằng SUM và GROUP BY type = 'expense')
- `summary.availableBalance`: Số dư khả dụng = Tổng thu - Tổng chi
- `chartData`: Mảng các đối tượng chứa dữ liệu theo tháng, được nhóm bằng `EXTRACT(MONTH FROM created_at)` và `EXTRACT(YEAR FROM created_at)`
  - `month`: Tháng (1-12)
  - `year`: Năm
  - `income`: Tổng thu nhập trong tháng đó
  - `expense`: Tổng chi tiêu trong tháng đó

**Lưu ý**: 
- Chỉ tính các giao dịch có `status = 'Completed'`
- Dữ liệu được sắp xếp theo thời gian (năm và tháng tăng dần)
- Nếu không có giao dịch trong tháng nào, tháng đó sẽ không xuất hiện trong `chartData`

### Response lỗi (401)
```json
{
  "message": "Không tìm thấy token xác thực. Vui lòng đăng nhập.",
  "success": false
}
```

---

## Hướng dẫn sử dụng Postman

### 1. Tạo Collection mới
- Mở Postman → New → Collection
- Đặt tên: `Expense Tracker API - Transaction`

### 2. Thiết lập Environment Variables
- Tạo Environment mới: `Local Development`
- Thêm biến: `base_url` = `http://localhost:3000`
- Thêm biến: `auth_token` = `<token từ API đăng nhập>`
- Thêm biến: `account_id_1` = `<ID tài khoản đầu tiên>`
- Thêm biến: `account_id_2` = `<ID tài khoản thứ hai>`

### 3. Sử dụng Token cho các API được bảo vệ
- Chọn tab **Authorization**
- Chọn type: **Bearer Token**
- Dán token vào ô **Token** hoặc sử dụng `{{auth_token}}`

### 4. Test Thêm giao dịch thu nhập
1. Tạo request mới: `POST {{base_url}}/api/transaction/add-transaction`
2. Chọn tab **Authorization** → **Bearer Token**
3. Dán token vào ô **Token** (hoặc dùng `{{auth_token}}`)
4. Chọn tab **Body** → **raw** → **JSON**
5. Dán request body với `accountId`, `amount`, `type: "income"` và `description` (tùy chọn)
6. Click **Send**
7. Kiểm tra số dư tài khoản đã được cộng thêm

### 5. Test Thêm giao dịch chi tiêu
1. Tạo request mới: `POST {{base_url}}/api/transaction/add-transaction`
2. Chọn tab **Authorization** → **Bearer Token**
3. Dán token vào ô **Token** (hoặc dùng `{{auth_token}}`)
4. Chọn tab **Body** → **raw** → **JSON**
5. Dán request body với `accountId`, `amount`, `type: "expense"` và `description` (tùy chọn)
6. Click **Send**
7. Kiểm tra số dư tài khoản đã được trừ đi
8. **Test trường hợp số dư không đủ**: Thử chi tiêu số tiền lớn hơn số dư hiện có → Kiểm tra lỗi "Insufficient balance"

### 6. Test Chuyển tiền giữa các tài khoản
1. Tạo request mới: `POST {{base_url}}/api/transaction/transfer-money`
2. Chọn tab **Authorization** → **Bearer Token**
3. Dán token vào ô **Token** (hoặc dùng `{{auth_token}}`)
4. Chọn tab **Body** → **raw** → **JSON**
5. Dán request body với `fromAccountId`, `toAccountId`, `amount` và `description` (tùy chọn)
6. Click **Send**
7. Kiểm tra:
   - Số dư tài khoản nguồn đã được trừ đi
   - Số dư tài khoản đích đã được cộng thêm
   - Có 2 giao dịch được tạo (1 expense cho tài khoản nguồn, 1 income cho tài khoản đích)
8. **Test trường hợp số dư không đủ**: Thử chuyển số tiền lớn hơn số dư tài khoản nguồn → Kiểm tra lỗi "Insufficient balance"
9. **Test trường hợp tài khoản giống nhau**: Thử chuyển tiền với `fromAccountId` = `toAccountId` → Kiểm tra lỗi

### 7. Test Lấy dữ liệu Dashboard
1. Tạo request mới: `GET {{base_url}}/api/transaction/get-dashboard`
2. Chọn tab **Authorization** → **Bearer Token**
3. Dán token vào ô **Token** (hoặc dùng `{{auth_token}}`)
4. Click **Send**
5. Kiểm tra:
   - `summary.totalIncome` và `summary.totalExpense` đúng với tổng các giao dịch
   - `summary.availableBalance` = `totalIncome` - `totalExpense`
   - `chartData` chứa dữ liệu được nhóm theo tháng

---

## Quy trình test đầy đủ

### Bước 1: Đăng nhập để lấy token
- Sử dụng API `POST /api/auth/sign-in` (xem file `POSTMAN_API_TEST_AUTH.md`)
- Copy token từ response

### Bước 2: Tạo tài khoản (nếu chưa có)
- Sử dụng API `POST /api/account/create-account` (xem file `POSTMAN_API_TEST_ACCOUNT.md`)
- Tạo ít nhất 2 tài khoản để test chuyển tiền
- Lưu `account.id` từ response

### Bước 3: Nạp tiền vào tài khoản (nếu cần)
- Sử dụng API `POST /api/account/add-money` (xem file `POSTMAN_API_TEST_ACCOUNT.md`)
- Nạp tiền vào tài khoản để có số dư cho các test tiếp theo

### Bước 4: Thêm giao dịch thu nhập
- Sử dụng API `POST /api/transaction/add-transaction`
- Nhập `accountId`, `amount`, `type: "income"`
- Kiểm tra số dư tài khoản đã được cộng thêm

### Bước 5: Thêm giao dịch chi tiêu
- Sử dụng API `POST /api/transaction/add-transaction`
- Nhập `accountId`, `amount`, `type: "expense"`
- Kiểm tra số dư tài khoản đã được trừ đi
- **Test edge case**: Thử chi tiêu số tiền lớn hơn số dư → Kiểm tra lỗi "Insufficient balance"

### Bước 6: Chuyển tiền giữa các tài khoản
- Sử dụng API `POST /api/transaction/transfer-money`
- Nhập `fromAccountId`, `toAccountId`, `amount`
- Kiểm tra:
  - Số dư tài khoản nguồn đã được trừ đi
  - Số dư tài khoản đích đã được cộng thêm
  - Có 2 giao dịch được tạo
- **Test edge case**: Thử chuyển số tiền lớn hơn số dư → Kiểm tra lỗi "Insufficient balance"

### Bước 7: Lấy dữ liệu Dashboard
- Sử dụng API `GET /api/transaction/get-dashboard`
- Kiểm tra:
  - Tổng thu nhập và chi tiêu đúng
  - Số dư khả dụng đúng
  - Dữ liệu biểu đồ được nhóm theo tháng đúng

### Bước 8: Kiểm tra tính nhất quán dữ liệu
- Sau khi thực hiện nhiều giao dịch, kiểm tra lại số dư các tài khoản
- Đảm bảo tổng số dư tất cả tài khoản = Tổng thu nhập - Tổng chi tiêu (không tính chuyển khoản)

---

## Lưu ý

- Tất cả các API `/api/transaction/*` đều yêu cầu xác thực bằng Bearer Token
- Token có thể lấy từ API đăng nhập (xem file `POSTMAN_API_TEST_AUTH.md`)
- Token có thời hạn 1 ngày
- Server phải đang chạy trên port 3000
- Mỗi user chỉ có thể thực hiện giao dịch trên tài khoản của chính mình
- **SQL Transaction**: Tất cả các thao tác cập nhật số dư và thêm giao dịch đều được thực hiện trong SQL Transaction để đảm bảo tính nhất quán dữ liệu. Nếu có lỗi, toàn bộ transaction sẽ được ROLLBACK
- **Kiểm tra số dư**: Hệ thống sẽ kiểm tra số dư trước khi cho phép chi tiêu hoặc chuyển tiền
- **Chuyển tiền**: Khi chuyển tiền, hệ thống sẽ tạo 2 giao dịch (1 expense cho tài khoản nguồn, 1 income cho tài khoản đích) để đảm bảo tổng tài sản không đổi
- **Dashboard**: Chỉ tính các giao dịch có `status = 'Completed'`
- Dữ liệu biểu đồ được nhóm theo tháng sử dụng `EXTRACT(MONTH FROM created_at)` và `EXTRACT(YEAR FROM created_at)`

---

## Ví dụ Request Body

### Thêm giao dịch thu nhập
```json
{
  "accountId": 1,
  "amount": 2000000,
  "type": "income",
  "description": "Nhận lương tháng 1"
}
```

### Thêm giao dịch chi tiêu
```json
{
  "accountId": 1,
  "amount": 500000,
  "type": "expense",
  "description": "Mua sắm tại siêu thị"
}
```

### Thêm giao dịch chi tiêu không có mô tả (sử dụng mô tả mặc định)
```json
{
  "accountId": 1,
  "amount": 300000,
  "type": "expense"
}
```

### Chuyển tiền với mô tả tùy chỉnh
```json
{
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": 500000,
  "description": "Chuyển tiền từ Visa sang Tiền mặt để chi tiêu"
}
```

### Chuyển tiền không có mô tả (sử dụng mô tả mặc định)
```json
{
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": 300000
}
```

---

## Test Cases quan trọng

### Test Case 1: Chi tiêu khi số dư không đủ
**Mục đích**: Kiểm tra hệ thống từ chối giao dịch chi tiêu khi số dư không đủ

**Bước thực hiện**:
1. Tạo tài khoản với số dư ban đầu = 100000
2. Thử chi tiêu 200000
3. Kiểm tra lỗi "Insufficient balance"
4. Kiểm tra số dư tài khoản vẫn là 100000 (không bị trừ)

**Kết quả mong đợi**: Lỗi 400 với message "Insufficient balance", số dư không đổi

### Test Case 2: Chuyển tiền khi số dư không đủ
**Mục đích**: Kiểm tra hệ thống từ chối chuyển tiền khi số dư tài khoản nguồn không đủ

**Bước thực hiện**:
1. Tạo 2 tài khoản: Tài khoản 1 có số dư 100000, Tài khoản 2 có số dư 0
2. Thử chuyển 200000 từ Tài khoản 1 sang Tài khoản 2
3. Kiểm tra lỗi "Insufficient balance"
4. Kiểm tra số dư cả 2 tài khoản không đổi

**Kết quả mong đợi**: Lỗi 400 với message "Insufficient balance", số dư cả 2 tài khoản không đổi

### Test Case 3: Tính nhất quán dữ liệu khi chuyển tiền
**Mục đích**: Kiểm tra tổng tài sản không đổi sau khi chuyển tiền

**Bước thực hiện**:
1. Tạo 2 tài khoản: Tài khoản 1 có số dư 1000000, Tài khoản 2 có số dư 500000
2. Tính tổng tài sản ban đầu: 1500000
3. Chuyển 300000 từ Tài khoản 1 sang Tài khoản 2
4. Kiểm tra:
   - Tài khoản 1 có số dư = 700000
   - Tài khoản 2 có số dư = 800000
   - Tổng tài sản sau chuyển = 1500000 (không đổi)

**Kết quả mong đợi**: Tổng tài sản không đổi sau khi chuyển tiền

### Test Case 4: SQL Transaction Rollback khi có lỗi
**Mục đích**: Kiểm tra hệ thống ROLLBACK khi có lỗi xảy ra

**Bước thực hiện**:
1. Tạo tài khoản với số dư ban đầu = 1000000
2. Thử thêm giao dịch với dữ liệu không hợp lệ (ví dụ: accountId không tồn tại)
3. Kiểm tra số dư tài khoản không đổi
4. Kiểm tra không có giao dịch mới được tạo

**Kết quả mong đợi**: Số dư và dữ liệu giao dịch không đổi khi có lỗi

