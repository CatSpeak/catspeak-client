# Hướng Dẫn Tích Hợp API - Quản Lý & Xem Video Bài Giảng (Recordings)

Tài liệu này cung cấp chi tiết các API Backend dành cho Frontend (`catspeak-client`) để tích hợp chức năng:
1. **Giáo viên:** Lưu/Đăng video sau khi kết thúc buổi dạy, quản lý danh sách video, đổi trạng thái hiển thị (Đăng/Ẩn), xóa video.
2. **Học viên:** Xem danh sách các video đã đăng theo từng lớp học (có phân trang) và phát video trực tiếp.

> [!NOTE]
> **Base Routes:**
> - Giáo viên (Teacher): `API_URL/api/teacher/classes/{classId}/recordings`
> - Học viên (Student): `API_URL/api/student/classes/{classId}/recordings`
> 
> **Authentication:** Tất cả các endpoint đều yêu cầu truyền Bearer Token tương ứng với Role của người dùng (`Teacher` hoặc `Student` đã đăng ký lớp học).

---

## DTO Models (Kiểu Dữ Liệu)

### 1. `ClassRecordingDto` (Thông tin chi tiết một video)
```typescript
interface ClassRecordingDto {
    id: number;
    classId: number;
    classSessionId: number;
    sessionNumber: number;      // Ví dụ: 1, 2, 3 (Buổi số mấy)
    sessionDate: string;        // Ngày của buổi học (YYYY-MM-DD)
    title: string;              // Tiêu đề video (Ví dụ: "Buổi 1 - 20/10/2026")
    videoUrl: string;           // Link video trực tiếp để play trên player
    durationSeconds: number;    // Độ dài video (giây)
    fileSizeBytes: number;      // Dung lượng file video (bytes)
    isPublished: boolean;       // true = Đã đăng lên giảng đường, false = Lưu nháp
    createdAt: string;          // Thời gian tạo (ISO-8601)
    publishedAt: string | null; // Thời gian publish lần đầu tiên
}
```

### 2. `PaginationInfo` (Thông tin phân trang)
```typescript
interface PaginationInfo {
    page: number;        // Trang hiện tại (1-based)
    pageSize: number;    // Số phần tử trên mỗi trang
    total: number;       // Tổng số lượng video thỏa mãn
    totalPages: number;  // Tổng số trang
}
```

### 3. `StudentRecordingListResponse` (Kết quả trả về cho học viên)
```typescript
interface StudentRecordingListResponse {
    recordings: ClassRecordingDto[];
    pagination: PaginationInfo;
}
```

---

## Các API Endpoints Dành Cho Giáo Viên (Teacher)

### 1. Lấy Danh Sách Video Của Lớp Học (Giáo Viên)
Hiển thị danh sách tất cả video của một lớp (cả bài đã đăng và bản nháp), dùng cho trang "Quản lý video" của giáo viên.

* **Endpoint:** `GET /api/teacher/classes/{classId}/recordings`
* **Response (200 OK):**
```json
{
  "recordings": [
    {
      "id": 1,
      "classId": 4,
      "classSessionId": 12,
      "sessionNumber": 1,
      "sessionDate": "2026-10-01",
      "title": "Buổi 1 - 2026-10-01",
      "videoUrl": "https://cdn.example.com/videos/v1.mp4",
      "durationSeconds": 3600,
      "fileSizeBytes": 104857600,
      "isPublished": true,
      "createdAt": "2026-10-01T15:30:00Z",
      "publishedAt": "2026-10-01T15:30:00Z"
    },
    {
      "id": 2,
      "classId": 4,
      "classSessionId": 13,
      "sessionNumber": 2,
      "sessionDate": "2026-10-03",
      "title": "Chữa bài tập phần Mảng",
      "videoUrl": "https://cdn.example.com/videos/v2.mp4",
      "durationSeconds": 4000,
      "fileSizeBytes": 120857600,
      "isPublished": false,
      "createdAt": "2026-10-03T15:30:00Z",
      "publishedAt": null
    }
  ]
}
```

---

### 2. Lưu Hoặc Đăng Video Mới (Sau khi tắt record)
Gọi API này ngay khi hệ thống xử lý xong video. Sẽ có 2 nút cho giáo viên chọn:
- Nút **"Đăng lên giảng đường"**: Truyền `isPublished: true`.
- Nút **"Lưu lại khoan đăng"**: Truyền `isPublished: false`.

* **Endpoint:** `POST /api/teacher/classes/{classId}/recordings`
* **Request Body:**
```json
{
  "classSessionId": 12,             // Bắt buộc - ID của buổi học hiện tại
  "recordingId": 42,                // ID video record từ hệ thống LiveKit (nếu có)
  "title": null,                    // Tùy chọn - Bỏ trống backend tự đặt tên "Buổi X - Ngày"
  "isPublished": false,             // Bắt buộc - True/False tùy ý định giáo viên
  "videoUrl": "https://url...",     // Bắt buộc - URL video gốc
  "durationSeconds": 3600,          // Tùy chọn - Thời gian tính bằng giây
  "fileSizeBytes": 104857600        // Tùy chọn - Kích thước file
}
```
* **Response (201 Created):** Trả về đối tượng `ClassRecordingDto` vừa tạo.

---

### 3. Thay Đổi Trạng Thái Video (Đăng / Gỡ Xuống)
Dùng trong trang Quản lý Video, khi giáo viên bấm "Đăng bài" ở một bản nháp, hoặc bấm "Ẩn" ở một bài đã đăng.

* **Endpoint:** `PUT /api/teacher/classes/{classId}/recordings/{id}/publish-status`
* **Request Body:**
```json
{
  "isPublished": true   // Hoặc false
}
```
* **Response (200 OK):** Trả về đối tượng `ClassRecordingDto` đã được cập nhật.

---

### 4. Xóa Video Khỏi Danh Sách
Dùng khi giáo viên muốn xóa bỏ video khỏi trang quản lý.

* **Endpoint:** `DELETE /api/teacher/classes/{classId}/recordings/{id}`
* **Response (204 No Content):** Không trả về body.

> [!WARNING]
> Hành động này chỉ xóa bản ghi trong Database để ẩn khỏi giao diện quản lý. Nếu cần xóa hẳn file vật lý trên Storage (như R2/S3), đội Backend sẽ cần xử lý logic webhook riêng. Frontend chỉ cần gọi API này.

---

## Các API Endpoints Dành Cho Học Viên (Student)

### 5. Lấy Danh Sách Video Đã Đăng (Có Phân Trang)
Dành cho học viên xem danh sách các video bài giảng đã được giáo viên công bố trong lớp học mà học viên đã đăng ký.

* **Endpoint:** `GET /api/student/classes/{classId}/recordings?page=1&pageSize=10`
* **Headers:** `Authorization: Bearer {student_token}`
* **Query Parameters:**
  - `page` *(number, optional, mặc định: 1)*: Số trang cần lấy.
  - `pageSize` *(number, optional, mặc định: 10)*: Số lượng video trên mỗi trang.

* **Response (200 OK):**
```json
{
  "recordings": [
    {
      "id": 1,
      "classId": 4,
      "classSessionId": 12,
      "sessionNumber": 1,
      "sessionDate": "2026-10-01",
      "title": "Buổi 1 - 2026-10-01",
      "videoUrl": "https://cdn.example.com/videos/v1.mp4",
      "durationSeconds": 3600,
      "fileSizeBytes": 104857600,
      "isPublished": true,
      "createdAt": "2026-10-01T15:30:00Z",
      "publishedAt": "2026-10-01T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

* **Error Responses:**
  - `401 Unauthorized`: Chưa truyền Token hoặc Token hết hạn.
  - `403 Forbidden`: Học viên chưa đăng ký lớp học này hoặc trạng thái đăng ký chưa được xác nhận (`Confirmed`).

> [!TIP]
> **Cơ chế xem video của học viên:**
> Khi học viên muốn xem video, Frontend **chỉ cần lấy trực tiếp link trong trường `videoUrl`** của đối tượng video đó và truyền vào player (thẻ `<video src={recording.videoUrl} controls />` hoặc mở Modal Video Player). Không cần phải gọi thêm bất kỳ API xem video nào khác từ backend.

---

## Luồng Gợi Ý Triển Khai Cho Frontend (UI Flow)

### 1. Phía Giáo Viên (Teacher Flow):
1. **Pop-up Kết Thúc Buổi Học (LiveKit/Room):**
   - Khi meeting kết thúc và video được generate xong, hiện modal: *"Buổi học đã được ghi hình thành công"*.
   - Có 2 nút: `[Lưu vào kho nháp]` và `[Đăng lên Giảng đường]`.
   - Cả 2 nút đều gọi chung API `POST` (số 2), chỉ khác nhau biến `isPublished`.

2. **Màn Hình Quản Lý Video (Teacher Dashboard > Lớp học > Video bài giảng):**
   - Gọi API `GET` (số 1) để lấy danh sách toàn bộ video (bao gồm bản nháp và đã đăng).
   - Trình bày dưới dạng Table hoặc Card (Hiển thị ngày tháng, buổi học, tiêu đề, trạng thái).
   - Có nút Play (Mở modal player phát link `videoUrl`).
   - Có nút Switch (Bật/Tắt trạng thái) gọi API `PUT` (số 3).
   - Có icon Thùng rác (Xóa video) gọi API `DELETE` (số 4).

### 2. Phía Học Viên (Student Flow):
1. **Màn Hình Bài Giảng / Video Lớp Học (Student > Khóa học của tôi > Lớp học > Video bài giảng):**
   - Gọi API `GET /api/student/classes/{classId}/recordings?page=1&pageSize=10` (số 5) để lấy danh sách video đã publish.
   - Hiển thị danh sách card video kèm phân trang dựa trên `pagination.total` và `pagination.totalPages`.
   - Mỗi card hiển thị: Buổi số mấy, ngày học, tiêu đề video, độ dài thời gian (`durationSeconds`).
   - **Khi học viên ấn vào video:** Mở màn hình/modal Video Player và truyền trực tiếp link `videoUrl` để phát video.


