# Tài liệu API - Tính năng Profile Wall & Reels Enhancement (CatSpeak)

Tài liệu này đặc tả chi tiết toàn bộ các cổng API đã được xây dựng và nâng cấp cho hai tính năng lớn: **Profile Wall (Trang cá nhân & Mối quan hệ Bạn bè/Theo dõi)** và **Reels Enhancement (Các tương tác Reels mở rộng)**.

---

## PHẦN I: TÍNH NĂNG PROFILE WALL (TRANG CÁ NHÂN & KẾT NỐI)

### 1. API Theo dõi người dùng (Follow User)
*   **Địa chỉ API (Endpoint)**: `POST /api/Friendship/follow`
*   **Mục đích**: Người dùng hiện tại thực hiện theo dõi (follow) tài khoản của người khác.
*   **Xác thực yêu cầu**: Bắt buộc (Bearer Token).
*   **Request Body**:
    *   Định dạng: `application/json`
    *   Tham số:
        | Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
        | :--- | :--- | :--- | :--- |
        | `targetAccountId` | `int` | Có | ID của tài khoản muốn theo dõi. |
*   **Request Body mẫu**:
    ```json
    {
      "targetAccountId": 42
    }
    ```
*   **Quy trình xử lý (Process)**:
    1.  Lấy `currentUserId` từ thông tin phiên đăng nhập (JWT Claims).
    2.  Kiểm tra xem `targetAccountId` có tồn tại trong hệ thống hay không. Nếu không, trả về `404 Not Found`.
    3.  Kiểm tra xem `currentUserId` có trùng với `targetAccountId` hay không (không được tự follow chính mình). Nếu trùng, trả về `400 Bad Request`.
    4.  Kiểm tra trong bảng `Follow` xem đã tồn tại mối quan hệ follow này chưa. Nếu đã follow, trả về `400 Bad Request` hoặc bỏ qua.
    5.  Thêm bản ghi mới vào bảng `Follow` với `FollowerId = currentUserId` và `FolloweeId = targetAccountId`.
    6.  Lưu thay đổi vào cơ sở dữ liệu và trả về kết quả thành công.
*   **Response Body thành công**:
    ```json
    {
      "success": true,
      "message": "Followed user successfully.",
      "data": null
    }
    ```
*   **Các HTTP Response có thể trả về**:
    *   `200 OK`: Thực hiện theo dõi thành công.
    *   `400 Bad Request`: Mối quan hệ đã tồn tại hoặc tự theo dõi chính mình.
    *   `401 Unauthorized`: Token không hợp lệ hoặc hết hạn.
    *   `404 Not Found`: Không tìm thấy tài khoản đích.
    *   `500 Internal Server Error`: Lỗi hệ thống khi thao tác cơ sở dữ liệu.

---

### 2. API Hủy theo dõi người dùng (Unfollow User)
*   **Địa chỉ API (Endpoint)**: `POST /api/Friendship/unfollow`
*   **Mục đích**: Người dùng hiện tại ngừng theo dõi tài khoản của người khác.
*   **Xác thực yêu cầu**: Bắt buộc (Bearer Token).
*   **Request Body**:
    *   Định dạng: `application/json`
    *   Tham số:
        | Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
        | :--- | :--- | :--- | :--- |
        | `targetAccountId` | `int` | Có | ID của tài khoản muốn hủy theo dõi. |
*   **Request Body mẫu**:
    ```json
    {
      "targetAccountId": 42
    }
    ```
*   **Quy trình xử lý (Process)**:
    1.  Lấy `currentUserId` từ phiên đăng nhập.
    2.  Kiểm tra xem đã tồn tại bản ghi trong bảng `Follow` mà `FollowerId = currentUserId` và `FolloweeId = targetAccountId` chưa.
    3.  Nếu không tồn tại, trả về `400 Bad Request` (Chưa từng theo dõi).
    4.  Xóa bản ghi khỏi bảng `Follow`.
    5.  Lưu vào cơ sở dữ liệu.
*   **Response Body thành công**:
    ```json
    {
      "success": true,
      "message": "Unfollowed user successfully.",
      "data": null
    }
    ```
*   **Các HTTP Response có thể trả về**:
    *   `200 OK`: Hủy theo dõi thành công.
    *   `400 Bad Request`: Chưa từng theo dõi người này.
    *   `401 Unauthorized`: Token chưa được truyền hoặc không hợp lệ.
    *   `500 Internal Server Error`: Lỗi database.

---

### 3. API Lấy trạng thái kết nối với tài khoản đích (Get Connection Status)
*   **Địa chỉ API (Endpoint)**: `GET /api/Friendship/status`
*   **Mục đích**: Kiểm tra mối quan hệ hiện tại giữa người dùng đang đăng nhập và tài khoản đích để hiển thị nút chức năng phù hợp trên giao diện (ví dụ: Kết bạn, Đồng ý, Theo dõi, Đang theo dõi, v.v.).
*   **Xác thực yêu cầu**: Bắt buộc (Bearer Token).
*   **Request Query Parameters**:
    *   `targetAccountId` (`int`, Bắt buộc): ID tài khoản cần kiểm tra.
*   **Quy trình xử lý (Process)**:
    1.  Lấy `currentUserId` từ token đăng nhập.
    2.  Truy vấn bảng `Friendships` để xem trạng thái kết bạn:
        -   Có lời mời kết bạn từ `currentUserId` gửi tới `targetAccountId` mà chưa duyệt (`Pending`)? -> `IsSentRequest = true`
        -   Có lời mời kết bạn từ `targetAccountId` gửi tới `currentUserId` đang chờ duyệt (`Pending`)? -> `IsReceivedRequest = true`
        -   Hai bên đã là bạn bè (`Accepted`)? -> `IsFriend = true`
    3.  Truy vấn bảng `Follow` để kiểm tra quan hệ theo dõi:
        -   `currentUserId` có đang follow `targetAccountId` không? -> `IsFollowing = true`
        -   `targetAccountId` có đang follow `currentUserId` không? -> `IsFollowedBy = true`
    4.  Trả về đối tượng tổ hợp trạng thái.
*   **Response Body thành công**:
    ```json
    {
      "success": true,
      "message": "Get connection status successfully.",
      "data": {
        "isFriend": false,
        "isSentRequest": true,
        "isReceivedRequest": false,
        "isFollowing": true,
        "isFollowedBy": false
      }
    }
    ```
*   **Các HTTP Response có thể trả về**:
    *   `200 OK`: Trả về dữ liệu trạng thái thành công.
    *   `401 Unauthorized`: Lỗi xác thực token.
    *   `404 Not Found`: Không tìm thấy tài khoản đối phương.

---

### 4. API Lấy danh sách bạn bè của người dùng (Get User Friends)
*   **Địa chỉ API (Endpoint)**: `GET /api/Friendship/user/{accountId}`
*   **Mục đích**: Truy xuất danh sách những tài khoản đã kết bạn (có trạng thái `Accepted`) của một tài khoản bất kỳ.
*   **Xác thực yêu cầu**: Không bắt buộc (nhưng lọc bảo mật dựa trên quyền riêng tư của tài khoản đích).
*   **Request Path Parameters**:
    *   `accountId` (`int`, Bắt buộc): ID tài khoản của tường nhà muốn xem danh sách bạn bè.
*   **Quy trình xử lý (Process)**:
    1.  Tìm kiếm tất cả các bản ghi trong bảng `Friendships` có trạng thái là `Accepted` và chứa `accountId` (ở cả hai vai trò gửi hoặc nhận).
    2.  Kết hợp thông tin tài khoản (Avatar, Username, Nickname, Level...) từ bảng `Account`.
    3.  Trả về danh sách danh sách đối tượng bạn bè rút gọn.
*   **Response Body thành công**:
    ```json
    {
      "success": true,
      "message": "Get friends list successfully.",
      "data": [
        {
          "accountId": 12,
          "username": "hoangnam",
          "nickname": "Nam Hoàng",
          "avatarImageUrl": "/uploads/avatars/nam.png",
          "level": "HSK4",
          "isOnline": true
        },
        {
          "accountId": 25,
          "username": "lanhuong",
          "nickname": "Hương Lan",
          "avatarImageUrl": null,
          "level": "HSK2",
          "isOnline": false
        }
      ]
    }
    ```
*   **Các HTTP Response có thể trả về**:
    *   `200 OK`: Trả về danh sách thành công (mảng có thể rỗng).
    *   `404 Not Found`: Không tồn tại tài khoản đích.

---

### 5. API Lấy danh sách Followers / Following
*   **Địa chỉ API (Endpoint)**: 
    *   Followers: `GET /api/Friendship/user/{accountId}/followers`
    *   Following: `GET /api/Friendship/user/{accountId}/following`
*   **Mục đích**: Lấy danh sách những người đang theo dõi tài khoản này, hoặc danh sách những người tài khoản này đang theo dõi.
*   **Request Path Parameters**:
    *   `accountId` (`int`, Bắt buộc)
*   **Quy trình xử lý (Process)**:
    -   Đối với Followers: Lấy tất cả tài khoản `Follower` có `FolloweeId = accountId` trong bảng `Follow`.
    -   Đối với Following: Lấy tất cả tài khoản `Followee` có `FollowerId = accountId` trong bảng `Follow`.
*   **Response Body mẫu**:
    ```json
    {
      "success": true,
      "message": "Get followers list successfully.",
      "data": [
        {
          "accountId": 30,
          "username": "tiendung",
          "nickname": "Dũng Tiến",
          "avatarImageUrl": "/uploads/avatars/dung.jpg",
          "level": "HSK1",
          "isOnline": false
        }
      ]
    }
    ```
*   **Các HTTP Response có thể trả về**:
    *   `200 OK` / `404 Not Found`.

---

### 6. API Lấy danh sách gợi ý bạn bè (Get Friend Recommendations)
*   **Địa chỉ API (Endpoint)**: `GET /api/Friendship/recommendations`
*   **Mục đích**: Gợi ý những tài khoản khác có thể người dùng muốn kết bạn/theo dõi (ví dụ: cùng học một ngôn ngữ, có bạn chung, hoặc người dùng mới nổi bật).
*   **Xác thực yêu cầu**: Bắt buộc (Bearer Token).
*   **Quy trình xử lý (Process)**:
    1.  Lấy `currentUserId`.
    2.  Lấy danh sách ID của những người đã kết bạn, đã gửi lời mời, hoặc đã follow của `currentUserId` để loại trừ.
    3.  Truy vấn các tài khoản đang hoạt động khác trong hệ thống loại trừ các ID trên và chính `currentUserId`.
    4.  Giới hạn số lượng gợi ý trả về (ví dụ: lấy 5-10 người dùng nổi bật hoặc ngẫu nhiên).
*   **Response Body mẫu**:
    ```json
    {
      "success": true,
      "message": "Get recommendations successfully.",
      "data": [
        {
          "accountId": 9,
          "username": "teacherchan",
          "nickname": "Chen Laoshi",
          "avatarImageUrl": "/avatars/chen.png",
          "level": "Teacher",
          "isOnline": true
        }
      ]
    }
    ```

---

### 7. API Lấy bài viết dòng thời gian của trang cá nhân (Get User Timeline Posts)
*   **Địa chỉ API (Endpoint)**: `GET /api/Post/user/{accountId}`
*   **Mục đích**: Lấy danh sách bài viết do chủ tường (`accountId`) đăng để hiển thị trên tab **Bài viết** của trang cá nhân, lọc theo quyền riêng tư.
*   **Xác thực yêu cầu**: Không bắt buộc (nhưng sẽ chỉ thấy bài viết Public nếu không đăng nhập).
*   **Request Query Parameters**:
    *   `page` (`int`, Mặc định: 1)
    *   `pageSize` (`int`, Mặc định: 10)
*   **Quy trình xử lý (Process)**:
    1.  Xác định danh tính người xem (`currentUserId`) thông qua token (nếu có).
    2.  Kiểm tra mối quan hệ giữa người xem và chủ tường (`accountId`):
        -   Nếu `currentUserId == accountId`: Người xem là chính chủ -> Lấy tất cả bài viết (`Public`, `FriendsOnly`, `Private/OnlyMe`).
        -   Nếu là bạn bè (`Accepted`): Lấy bài viết ở chế độ `Public` và `FriendsOnly`.
        -   Nếu không phải bạn bè hoặc chưa đăng nhập: Chỉ lấy bài viết ở chế độ `Public`.
    3.  Thực hiện phân trang và trả về danh sách bài đăng đã sắp xếp giảm dần theo thời gian tạo.
*   **Response Body mẫu**:
    ```json
    {
      "success": true,
      "message": "Get user posts successfully.",
      "data": [
        {
          "postId": 105,
          "accountId": 42,
          "username": "quang2810",
          "title": null,
          "content": "Hôm nay thời tiết đẹp quá!",
          "privacy": 0, 
          "createDate": "2026-07-09T14:55:00Z",
          "postMedias": [
            {
              "mediaId": 201,
              "mediaUrl": "/uploads/media/sky.jpg",
              "mediaType": 1,
              "fileName": "sky.jpg",
              "fileSize": 102450
            }
          ]
        }
      ]
    }
    ```
*   **Các HTTP Response có thể trả về**:
    *   `200 OK`: Thành công.
    *   `404 Not Found`: Không tìm thấy tài khoản.

---

### 8. API Lấy thư viện hình ảnh và video (Get User Wall Media)
*   **Địa chỉ API (Endpoint)**: `GET /api/Post/user/{accountId}/media`
*   **Mục đích**: Trích xuất tất cả các tệp hình ảnh và video đính kèm từ các bài viết hợp lệ của người dùng đó (đáp ứng quyền riêng tư của người xem) phục vụ cho tab **Ảnh** và tab **Video**.
*   **Request Query Parameters**: `page` (int), `pageSize` (int).
*   **Quy trình xử lý (Process)**:
    1.  Tương tự API Lấy bài viết dòng thời gian, xác định danh sách các bài viết hợp lệ dựa vào quyền hạn của người xem.
    2.  Từ các bài viết hợp lệ đó, trích xuất danh sách các `PostMedia` có kiểu dữ liệu là `Image` (1) hoặc `Video` (2).
    3.  Trả về danh sách các tệp media này kèm theo thông tin bài viết gốc.
*   **Response Body mẫu**:
    ```json
    {
      "success": true,
      "message": "Get media items successfully.",
      "data": [
        {
          "mediaId": 201,
          "postId": 105,
          "mediaUrl": "/uploads/media/sky.jpg",
          "mediaType": 1,
          "fileName": "sky.jpg",
          "fileSize": 102450
        }
      ]
    }
    ```

---

### 9. API Lấy thư viện tài liệu văn bản (Get User Wall Documents)
*   **Địa chỉ API (Endpoint)**: `GET /api/Post/user/{accountId}/documents`
*   **Mục đích**: Trích xuất các tài liệu đính kèm (Word, Excel, PDF, ZIP, RAR...) phục vụ cho tab **Tài liệu** trên trang cá nhân.
*   **Quy trình xử lý (Process)**:
    1.  Xác định các bài viết hợp lệ dựa theo quyền riêng tư của người xem.
    2.  Trích xuất các `PostMedia` có kiểu dữ liệu là `File` (3).
    3.  Trả về danh sách tài liệu văn bản để người dùng tải xuống.
*   **Response Body mẫu**:
    ```json
    {
      "success": true,
      "message": "Get document items successfully.",
      "data": [
        {
          "mediaId": 205,
          "postId": 108,
          "mediaUrl": "/uploads/files/lesson3.pdf",
          "mediaType": 3,
          "fileName": "lesson3.pdf",
          "fileSize": 2048500
        }
      ]
    }
    ```

---
---

`.
