# Tài liệu Tích hợp API Phân hệ Điểm Thưởng & Voucher (Dành cho Frontend)

Tài liệu này cung cấp chi tiết kỹ thuật cho đội ngũ Frontend (Web / Mobile App) để tích hợp phân hệ **Điểm thưởng & Đổi Voucher** của hệ thống Cat Speak.

---

## 📌 Context & Thông tin Chung

- **Base URL**: `https://api.catspeak.com` *(Tùy thuộc vào môi trường Staging/Production)*
- **Content-Type**: `application/json`
- **Authentication**: `Bearer Token` qua HTTP Header:
  ```http
  Authorization: Bearer {JWT_TOKEN}
  ```
- **Chuẩn định dạng Ngày/Giờ**: ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`)

---

## 📑 Danh Sách Endpoints Summary

| STT | Phương thức | Endpoint Path | Mô tả Chức năng | Quyền Truy Cập |
|-----|-------------|---------------|------------------|----------------|
| 1 | `GET` | `/api/points/overview` | Lấy tổng quan điểm thưởng học viên | Authenticated |
| 2 | `GET` | `/api/points/history` | Lấy lịch sử biến động điểm (phân trang) | Authenticated |
| 3 | `GET` | `/api/vouchers/templates` | Lấy danh mục Voucher có thể đổi | Authenticated |
| 4 | `POST` | `/api/vouchers/redeem/{templateId}` | Thực hiện đổi Voucher bằng điểm | Authenticated |
| 5 | `GET` | `/api/vouchers/inventory` | Lấy danh sách kho Voucher của học viên | Authenticated |
| 6 | `POST` | `/api/points/earn` | Cộng điểm cho học viên (Admin/Trigger) | Admin |
| 7 | `POST` | `/api/internal/jobs/points/expire` | Cron job: Xử lý lô điểm hết hạn | Admin |
| 8 | `POST` | `/api/internal/jobs/points/birthday` | Cron job: Tặng điểm sinh nhật | Admin |
| 9 | `POST` | `/api/internal/jobs/vouchers/expire` | Cron job: Xử lý Voucher hết hạn | Admin |

---

## 1. Chi Tiết API Phân Hệ Điểm Thưởng (Points API)

### 1.1 GET `/api/points/overview` - Lấy Tổng quan Điểm Thưởng

- **Mô tả**: Trả về số dư điểm hiện tại, tổng điểm đã tích, tổng điểm đã tiêu, số điểm sắp hết hạn (trong 30 ngày) và 5 giao dịch gần đây nhất. Dùng để render **Tab Tổng quan**.
- **Header**: `Authorization: Bearer {JWT_TOKEN}`
- **Request Body**: *Không có (Empty)*
- **Query Parameters**: *Không có*
- **Response Structure & Types**:
  - `balance` (`number/int`): Số dư điểm khả dụng hiện tại.
  - `totalEarned` (`number/int`): Tổng số điểm đã tích lũy từ trước tới nay.
  - `totalRedeemed` (`number/int`): Tổng số điểm đã quy đổi voucher.
  - `expiringSoon` (`number/int`): Số điểm sẽ hết hạn trong vòng 30 ngày tới.
  - `recentActivities` (`array`): Danh sách 5 giao dịch gần nhất.
- **HTTP Response Codes**:
  - `200 OK`: Thành công.
  - `401 Unauthorized`: Token không hợp lệ hoặc hết hạn.

#### 🟢 Sample Response `200 OK`
```json
{
  "balance": 1250,
  "totalEarned": 2000,
  "totalRedeemed": 750,
  "expiringSoon": 100,
  "recentActivities": [
    {
      "transactionId": 45,
      "type": "Earn",
      "amount": 50,
      "sourceDescription": "Đánh giá khóa học IEL-102",
      "createdAt": "2026-09-29T10:00:00Z"
    },
    {
      "transactionId": 44,
      "type": "Redeem",
      "amount": -300,
      "sourceDescription": "Đổi Voucher Giảm 50.000đ học phí",
      "createdAt": "2026-09-25T14:30:00Z"
    }
  ]
}
```

---

### 1.2 GET `/api/points/history` - Lấy Lịch sử Biến động Điểm

- **Mô tả**: Trả về danh sách lịch sử cộng/trừ/hết hạn điểm có phân trang. Dùng cho **Tab Lịch sử điểm**.
- **Header**: `Authorization: Bearer {JWT_TOKEN}`
- **Query Parameters**:
  | Tham số | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Mô tả |
  |---------|--------------|----------|-------------------|-------|
  | `page` | `integer` | Không | `1` | Trang hiện tại (bắt đầu từ 1) |
  | `pageSize` | `integer` | Không | `10` | Số lượng mục trên mỗi trang |

- **Request Body**: *Không có*
- **Response Structure**: Array các đối tượng `PointTransactionDto`:
  - `transactionId` (`int`): ID giao dịch.
  - `type` (`string`): Loaị biến động. Các giá trị: `"Earn"` (Tích điểm), `"Redeem"` (Đổi voucher), `"Expire"` (Hết hạn).
  - `amount` (`int`): Số điểm biến động. (Dương khi tích điểm, Âm khi đổi voucher hoặc hết hạn).
  - `sourceDescription` (`string`): Mô tả lý do/nguồn phát sinh điểm.
  - `createdAt` (`string/ISO8601`): Thời gian thực hiện giao dịch.
- **HTTP Response Codes**:
  - `200 OK`: Thành công.
  - `401 Unauthorized`: Token không hợp lệ.

#### 🟢 Sample Response `200 OK`
```json
[
  {
    "transactionId": 45,
    "type": "Earn",
    "amount": 50,
    "sourceDescription": "Đánh giá khóa học IEL-102",
    "createdAt": "2026-09-29T10:00:00Z"
  },
  {
    "transactionId": 44,
    "type": "Redeem",
    "amount": -300,
    "sourceDescription": "Đổi Voucher Giảm 50.000đ học phí",
    "createdAt": "2026-09-25T14:30:00Z"
  },
  {
    "transactionId": 30,
    "type": "Expire",
    "amount": -50,
    "sourceDescription": "Điểm thưởng sinh nhật hết hạn",
    "createdAt": "2026-09-01T00:00:00Z"
  }
]
```

---

### 1.3 POST `/api/points/earn` - Cộng Điểm cho Học viên (Admin / Internal)

- **Mô tả**: Dùng để cộng điểm cho học viên khi hoàn thành nhiệm vụ, sự kiện đặc biệt hoặc điều chỉnh từ Admin.
- **Header**: `Authorization: Bearer {JWT_TOKEN}` (Yêu cầu Role `Admin`)
- **Query Parameters**:
  | Tham số | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Mô tả |
  |---------|--------------|----------|-------------------|-------|
  | `accountId` | `integer` | **Có** | - | ID tài khoản học viên |
  | `amount` | `integer` | **Có** | - | Số điểm cần cộng (> 0) |
  | `description` | `string` | **Có** | - | Lý do cộng điểm (vd: "Tặng điểm sinh nhật") |
  | `validityMonths` | `integer` | Không | `12` | Số tháng hiệu lực của lô điểm |
  | `validityDays` | `integer` | Không | `0` | Số ngày hiệu lực (khi muốn set < 1 tháng, ví dụ sinh nhật set `validityMonths=0`, `validityDays=30`) |

- **Request Body**: *Không có*
- **HTTP Response Codes**:
  - `200 OK`: Cộng điểm thành công.
  - `400 Bad Request`: Tham số không hợp lệ.
  - `403 Forbidden`: Quyền tài khoản không phải Admin.

---

## 2. Chi Tiết API Phân Hệ Voucher (Vouchers API)

### 2.1 GET `/api/vouchers/templates` - Danh mục Voucher Có thể đổi

- **Mô tả**: Lấy danh sách các ưu đãi/voucher template hiện có trong hệ thống. Danh sách đã được backend tự động sắp xếp theo thứ tự ưu tiên:
  1. Đủ điểm & còn hàng (`isRedeemable = true`)
  2. Còn hàng nhưng chưa đủ điểm
  3. Hết hàng
- **Header**: `Authorization: Bearer {JWT_TOKEN}`
- **Query Parameters**: *Không có*
- **Request Body**: *Không có*
- **Response Fields**:
  - `templateId` (`int`): ID mẫu voucher.
  - `name` (`string`): Tên ưu đãi (vd: "Giảm 50.000đ học phí").
  - `discountType` (`string`): Loại giảm giá (`"FixedAmount"` hoặc `"Percentage"`).
  - `discountValue` (`int`): Giá trị giảm (vd: `50000` hoặc `20` đại diện cho 20%).
  - `pointsRequired` (`int`): Số điểm cần thiết để quy đổi.
  - `stock` (`int`): Số lượng voucher còn lại trong kho.
  - `validityDays` (`int`): Hạn sử dụng (số ngày) kể từ thời điểm đổi thành công.
  - `conditions` (`string`): Điều kiện áp dụng (vd: "Đơn từ 300.000đ").
  - `isRedeemable` (`boolean`): `true` nếu user đủ điểm và kho còn hàng; `false` nếu không đủ điều kiện.
  - `notRedeemableReason` (`string?`): Lý do không thể đổi (`"Hết hàng"`, `"Cần thêm 50 điểm"` hoặc `null` nếu đủ điều kiện).
- **HTTP Response Codes**:
  - `200 OK`: Thành công.

#### 🟢 Sample Response `200 OK`
```json
[
  {
    "templateId": 1,
    "name": "Giảm 50.000đ học phí",
    "discountType": "FixedAmount",
    "discountValue": 50000,
    "pointsRequired": 300,
    "stock": 45,
    "validityDays": 30,
    "conditions": "Áp dụng cho đơn hàng từ 300.000đ",
    "isRedeemable": true,
    "notRedeemableReason": null
  },
  {
    "templateId": 2,
    "name": "Giảm 20% Khóa học Combo",
    "discountType": "Percentage",
    "discountValue": 20,
    "pointsRequired": 1500,
    "stock": 10,
    "validityDays": 15,
    "conditions": "Giảm tối đa 200.000đ",
    "isRedeemable": false,
    "notRedeemableReason": "Cần thêm 250 điểm"
  }
]
```

---

### 2.2 POST `/api/vouchers/redeem/{templateId}` - Thực hiện Đổi Voucher

- **Mô tả**: User thực hiện đổi điểm lấy Voucher. Backend sẽ kiểm tra số dư điểm, trừ điểm FIFO, trừ kho stock, tạo mã voucher độc nhất (`CAT-XXXXX`) và lưu lịch sử giao dịch.
- **Header**: `Authorization: Bearer {JWT_TOKEN}`
- **Path Parameters**:
  - `templateId` (`integer`, required): ID của template voucher muốn đổi.
- **Request Body**: *Không có*
- **Response Fields**:
  - `voucherId` (`int`): ID mã voucher được cấp.
  - `code` (`string`): Mã ưu đãi (vd: `"CAT-A8K9M"`).
  - `name` (`string`): Tên ưu đãi.
  - `discountType` (`string`): Loại giảm giá.
  - `discountValue` (`int`): Giá trị giảm.
  - `status` (`string`): Trạng thái (`"Unused"`).
  - `expiresAt` (`string/ISO8601`): Ngày hết hạn voucher.
- **HTTP Response Codes**:
  - `200 OK`: Đổi thành công.
  - `400 Bad Request`: Lỗi nghiệp vụ (Không đủ điểm, hết hàng, hoặc đã đổi trong ngày).

#### 🟢 Sample Response `200 OK`
```json
{
  "voucherId": 102,
  "code": "CAT-7X89M",
  "name": "Giảm 50.000đ học phí",
  "discountType": "FixedAmount",
  "discountValue": 50000,
  "status": "Unused",
  "expiresAt": "2026-10-29T17:00:00Z"
}
```

#### 🔴 Sample Response `400 Bad Request` (Khi lỗi nghiệp vụ)
```json
{
  "message": "Not enough points." 
}
```
*Các thông điệp lỗi nghiệp vụ khác:*
- `"Voucher is out of stock."`
- `"Voucher already redeemed today."`
- `"Voucher template not found or inactive."`

---

### 2.3 GET `/api/vouchers/inventory` - Xem Kho Voucher cá nhân

- **Mô tả**: Trả về danh sách Voucher cá nhân mà học viên đang sở hữu. Dùng cho **Tab Kho Voucher**.
- **Header**: `Authorization: Bearer {JWT_TOKEN}`
- **Query Parameters**:
  | Tham số | Kiểu dữ liệu | Bắt buộc | Giá trị mặc định | Giá trị tiếp nhận | Mô tả |
  |---------|--------------|----------|-------------------|-------------------|-------|
  | `status` | `string` | Không | `"Unused"` | `Unused`, `Used`, `Expired` | Lọc voucher theo trạng thái sử dụng |

- **Request Body**: *Không có*
- **HTTP Response Codes**:
  - `200 OK`: Thành công.

#### 🟢 Sample Response `200 OK`
```json
[
  {
    "voucherId": 102,
    "code": "CAT-7X89M",
    "name": "Giảm 50.000đ học phí",
    "discountType": "FixedAmount",
    "discountValue": 50000,
    "status": "Unused",
    "expiresAt": "2026-10-29T17:00:00Z",
    "redeemedAt": null
  },
  {
    "voucherId": 88,
    "code": "CAT-3M91K",
    "name": "Giảm 20.000đ Nạp Xu",
    "discountType": "FixedAmount",
    "discountValue": 20000,
    "status": "Used",
    "expiresAt": "2026-08-30T00:00:00Z",
    "redeemedAt": "2026-08-15T10:30:00Z"
  }
]
```

---

## 3. Chi Tiết API Jobs Tự Động (Internal Cron Jobs API)

Các API này phục vụ dịch vụ Schedulers/Cron Jobs tự động của hệ thống chạy định kỳ (vd: nửa đêm 00:00 UTC).

| Endpoint | Method | Role | Mô tả Tác vụ |
|----------|--------|------|--------------|
| `/api/internal/jobs/points/expire` | `POST` | `Admin` | Quét và trừ điểm hết hạn theo từng lô (FIFO). Trừ điểm `Balance` và tạo transaction loại `"Expire"`. |
| `/api/internal/jobs/points/birthday` | `POST` | `Admin` | Quét tất cả học viên có ngày sinh hôm nay và tự động cộng 100 điểm thưởng sinh nhật (hạn 30 ngày). |
| `/api/internal/jobs/vouchers/expire` | `POST` | `Admin` | Quét tất cả Voucher ở trạng thái `Unused` đã quá ngày `ExpiresAt` và đổi trạng thái thành `Expired`. |

---

## 🛠️ Hướng Dẫn Tích Hợp Chi Tiết Cho Đội Frontend (FE Integration Notes)

### 1. Mapping Giao Diện UI Theo Các Tab Chức Năng

#### 🟢 **Tab 1: Tổng quan (Overview Tab)**
- **API sử dụng**: `GET /api/points/overview` và `GET /api/vouchers/templates`.
- **Thành phần UI**:
  - **Banner / Card Số dư**: Hiển thị `balance` (Điểm hiện có), `expiringSoon` (Điểm sắp hết hạn trong 30 ngày), `totalEarned` và `totalRedeemed`.
  - **Mục "Có thể đổi ngay"**: Gọi `GET /api/vouchers/templates`, lọc danh sách các voucher có `isRedeemable === true`, lấy 2 item đầu tiên để hiển thị làm gợi ý nhanh.
  - **Mục "Hoạt động gần đây"**: Hiển thị 5 item trong mảng `recentActivities`. Format màu sắc:
    - Loại `Earn`: Số điểm hiển thị dấu `+` (màu xanh lá).
    - Loại `Redeem` / `Expire`: Số điểm hiển thị dấu `-` (màu đỏ / xám).

#### 🟢 **Tab 2: Lịch sử điểm (Points History Tab)**
- **API sử dụng**: `GET /api/points/history?page={page}&pageSize={pageSize}`
- **Thành phần UI**:
  - Render danh sách biến động dạng Timeline hoặc Table.
  - Tích hợp **Phân trang (Pagination)** hoặc **Infinite Scroll**: Gọi API với `page` tăng dần khi user cuộn xuống hoặc đổi trang.

#### 🟢 **Tab 3: Đổi Voucher (Voucher Marketplace Tab)**
- **API sử dụng**: `GET /api/vouchers/templates` và `POST /api/vouchers/redeem/{templateId}`
- **Thành phần UI**:
  - Render danh sách thẻ Voucher.
  - Nếu `isRedeemable === true`: Nút "Đổi ngay" được Enable (Màu nổi bật).
  - Nếu `isRedeemable === false`: Nút "Đổi ngay" bị **Disabled**, bên dưới hiển thị nhãn lý do `notRedeemableReason` (vd: *"Cần thêm 150 điểm"* hoặc *"Hết hàng"*).
  - **Luồng Xử Lý Khi Bấm Đổi Voucher**:
    1. Hiển thị Popup Confirm: *"Bạn có chắc muốn dùng {pointsRequired} điểm để đổi {name}?"*
    2. Khi User bấm xác nhận: Gọi API `POST /api/vouchers/redeem/{templateId}`.
    3. Trả về kết quả thành công (`200 OK`): Mở Modal **"Đổi Voucher Thành Công"** hiển thị mã voucher (`code`), ngày hết hạn và nút **"Sao chép mã"**. Đồng thời re-fetch lại API Overview & Templates để cập nhật số dư điểm mới.

#### 🟢 **Tab 4: Kho Voucher (Voucher Inventory Tab)**
- **API sử dụng**: `GET /api/vouchers/inventory?status={status}`
- **Thành phần UI**:
  - Render Sub-tabs lọc theo 3 trạng thái: **Chưa dùng (`Unused`)**, **Đã dùng (`Used`)**, **Hết hạn (`Expired`)**.
  - Mỗi thẻ Voucher hiển thị: Tên, Mã Voucher (`CAT-XXXXX`), Ngày hết hạn, Nút "Sao chép" (chỉ hiển thị ở tab `Unused`).

---

### 2. Quy Tắc Xử Lý Trạng Thái & Lỗi Ở Frontend (UX Best Practices)

#### 1️⃣ **Cơ chế Auto Retry & Network Error**
- Đối với API `POST /api/vouchers/redeem/{templateId}`, nếu xảy ra lỗi kết nối mạng (Network Timeout / Offline), FE cần triển khai cơ chế **Retry tự động tối đa 3 lần** (khoảng cách giữa các lần là 2 giây) trước khi báo lỗi cho người dùng.

#### 2️⃣ **Khóa Modal & Loading UI State**
- Trong quá trình API `Redeem` đang chờ phản hồi (`pending`), FE **bắt buộc phải khóa Modal** (Disable nút Đóng `X`, disable hiệu ứng click backdrop outside, hiển thị Spinner loading trên nút Đổi) để tránh việc người dùng click nhiều lần tạo request trùng lặp (Double Submission).

#### 3️⃣ **Mã Lỗi Kỹ Thuật (Technical Error Display)**
- Trường hợp server phản hồi lỗi 500 hoặc thất bại sau 3 lần retry, FE tạo mã lỗi hiển thị theo chuẩn: `ERR-{Timestamp}-{UserId}` (Ví dụ: `ERR-1727600000-102`) và hiển thị thông báo: *"Có lỗi kỹ thuật xảy ra. Vui lòng thử lại sau. Mã lỗi: ERR-..."*.

#### 4️⃣ **Thông báo Copy thành công (Toast Notification)**
- Khi người dùng bấm nút **"Sao chép mã"** trên bất kỳ mã Voucher nào, FE thực hiện copy mã vào Clipboard và kích hoạt **Toast Notification** nhỏ ở góc màn hình: *"Đã sao chép mã CAT-XXXXX vào bộ nhớ tạm!"* trong 2 giây.
