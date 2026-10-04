# Đặc tả Kỹ thuật Backend: Bổ sung API & SignalR cho In-Chat Call & Quản trị Chat
> **Tài liệu bàn giao cho Backend Developer**  
> **Dự án**: CatSpeak Web Client & Backend API  
> **Tính năng**: In-Chat LiveKit Calling & Chat Enhancements  
> **Ngày tạo**: 04/10/2026  

---

## 1. Tóm tắt Vấn đề & Mục tiêu (Context & Problem Statement)

1. **Vấn đề nhận cuộc gọi khi chưa mở trình duyệt / vừa mở lại web**:
   - Hiện tại, khi User A gọi User B, Backend chỉ bắn sự kiện SignalR `CallStarted` (fire-and-forget qua WebSocket).
   - Nếu User B đang **đóng tab hoặc vừa mở trình duyệt** sau khi User A đã bắt đầu gọi (nhưng User A vẫn đang reo chuông chờ), User B hoàn toàn **không nhận được cuộc gọi** vì không có API để kiểm tra xem có cuộc gọi nào đang chờ mình hay không.
2. **Thiếu luồng Từ chối cuộc gọi (Reject/Decline)**:
   - Khi User B bấm nút "Từ chối" trên popup, hiện tại client chỉ đóng modal cục bộ. User A vẫn tiếp tục ngồi nghe đổ chuông vô ích suốt 45 giây vì không có API thông báo từ chối về server.
3. **Thiếu cơ chế Cuộc gọi nhỡ (Missed Call)**:
   - Chưa có timeout tự động (sau 30–45s) để server đóng phòng và ghi tin nhắn hệ thống *"Cuộc gọi nhỡ"* vào cuộc trò chuyện.

---

## 2. Danh sách REST API Cần Bổ sung

### 2.1. API Kiểm tra Cuộc gọi đến Đang chờ (Active Incoming Call)

- **Endpoint**: `GET /api/conversations/calls/active-incoming`
- **Mục đích**: Client gọi mỗi khi load app, reload trang hoặc kết nối lại SignalR để kiểm tra xem có cuộc gọi nào đang đổ chuông chờ mình hay không.
- **Authentication**: `Bearer <JWT_Token>`
- **Logic Backend**:
  1. Lấy `accountId` của user hiện tại từ token.
  2. Tìm trong Redis / Database xem có phiên gọi nào đang ở trạng thái `RINGING` hoặc `ACTIVE` mà user này là người nhận (trong chat 1-1 hoặc chat nhóm).
  3. Kiểm tra thời gian bắt đầu: Nếu vẫn còn trong khoảng thời gian đổ chuông cho phép (`<= 45 giây`) và user chưa bấm từ chối.
  4. Nếu có, tạo hoặc cấp lại LiveKit JWT token cho user đó để sẵn sàng kết nối.

- **Response thành công (200 OK) - Có cuộc gọi đang chờ**:
```json
{
  "hasActiveCall": true,
  "callId": "d98f7e2a-1111-2222-3333-444455556666",
  "conversationId": 10,
  "callerId": 1,
  "callerName": "Alice Nguyễn",
  "callerAvatar": "https://api.catspeak.com.vn/avatars/alice.jpg",
  "callType": "video",
  "roomName": "call_10_1727322300000",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "serverUrl": "wss://livekit.catspeak.com.vn",
  "startedAt": "2026-10-04T04:15:00Z",
  "ringingTimeoutSeconds": 45,
  "elapsedSeconds": 15
}
```

- **Response khi không có cuộc gọi nào (200 OK)**:
```json
{
  "hasActiveCall": false
}
```

---

### 2.2. API Từ chối Cuộc gọi (Reject / Decline Call)

- **Endpoint**: `POST /api/conversations/{conversationId}/calls/reject`
- **Mục đích**: Người nhận bấm "Từ chối" trên popup cuộc gọi đến.
- **Request Body**:
```json
{
  "callId": "d98f7e2a-1111-2222-3333-444455556666",
  "reason": "declined"
}
```
- **Logic Backend**:
  1. Xác thực user hiện tại có thuộc cuộc gọi này không.
  2. **Đối với cuộc gọi 1-1**:
     - Hủy phiên gọi ngay lập tức, chuyển trạng thái sang `DECLINED`.
     - Giải phóng phòng LiveKit.
     - Phát sự kiện SignalR `CallRejected` tới người gọi (User A) để client của A lập tức dừng chuông và hiển thị thông báo *"Người nhận đã từ chối cuộc gọi"*.
     - Tự động tạo tin nhắn hệ thống trong chat: *"Cuộc gọi đã bị từ chối"*.
  3. **Đối với cuộc gọi nhóm**:
     - Đánh dấu user này đã từ chối (không làm gián đoạn cuộc gọi của các thành viên khác).
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Call declined successfully"
}
```

---

## 3. Bổ sung Sự kiện SignalR

| Tên sự kiện (Event Name) | Target Group / User | Payload DTO | Mục đích & Xử lý Frontend |
| :--- | :--- | :--- | :--- |
| **`CallRejected`** | `conversation_{id}` hoặc `user_{callerId}` | `CallRejectedEventDto` | Báo cho người gọi (Caller) biết người nhận đã từ chối cuộc gọi để lập tức ngừng chuông và hiển thị thông báo. |
| **`MemberRemoved`** | `conversation_{id}` | `MemberRemovedEventDto` | Thông báo khi một thành viên bị xóa khỏi nhóm để client người đó tự động đóng khung chat và hiển thị thông báo. |

### DTO Chi tiết:

#### `CallRejectedEventDto`:
```json
{
  "conversationId": 10,
  "callId": "d98f7e2a-1111-2222-3333-444455556666",
  "callerId": 1,
  "rejectedByAccountId": 2,
  "rejectedByName": "Bob Trần",
  "reason": "declined",
  "timestamp": "2026-10-04T04:15:20Z"
}
```

#### `MemberRemovedEventDto`:
```json
{
  "conversationId": 10,
  "removedAccountId": 5,
  "removedByName": "Charlie",
  "actorAccountId": 1,
  "actorName": "Alice (Trưởng nhóm)",
  "timestamp": "2026-10-04T04:15:20Z"
}
```

---

## 4. Quản lý Vòng đời Cuộc gọi & Cuộc gọi nhỡ (State Machine & Timeouts)

### 4.1. Thời gian đổ chuông tối đa (Ringing TTL)
- Thời gian chờ người nhận bắt máy: **45 giây**.
- Nếu sau 45 giây người nhận không bấm "Nghe" hoặc "Từ chối":
  1. Background Worker (hoặc Redis Key Expiration) tự động chuyển trạng thái cuộc gọi thành `MISSED`.
  2. Bắn sự kiện SignalR `CallEnded` với payload:
     ```json
     {
       "conversationId": 10,
       "callId": "d98f7e2a-...",
       "reason": "timeout",
       "durationSeconds": 0
     }
     ```
  3. Đóng LiveKit Room.
  4. Tự động thêm tin nhắn hệ thống vào cuộc trò chuyện:
     ```
     📞 Cuộc gọi thoại/video nhỡ • 11:15
     ```

### 4.2. Bảng Trạng thái Cuộc gọi (Call Status Enum)
```
RINGING (0) -> CONNECTED (1) -> COMPLETED (2)
            -> DECLINED (3)
            -> MISSED (4)
```

---

## 5. Web Push Notification (Khi Người dùng Tắt hẳn Trình duyệt)

Khi người dùng A gọi người dùng B mà B đang không online:
1. Tại endpoint `POST /api/conversations/{id}/calls/initiate`:
   - Backend gửi Web Push qua Firebase Cloud Messaging (FCM) với `priority: "high"`.
2. **Payload Push Mẫu**:
```json
{
  "notification": {
    "title": "Cuộc gọi video đến từ Alice Nguyễn",
    "body": "Đang đổ chuông...",
    "icon": "/logo192.png",
    "tag": "call-10"
  },
  "data": {
    "type": "INCOMING_CALL",
    "conversationId": "10",
    "callId": "d98f7e2a-...",
    "callerName": "Alice Nguyễn",
    "callType": "video"
  }
}
```
3. Khi người dùng click vào thông báo trên máy tính/điện thoại, trình duyệt sẽ mở URL cuộc trò chuyện: `https://catspeak.com.vn/chat?callId=d98f7e2a-...` và tự động kích hoạt API `active-incoming` để kết nối vào cuộc gọi.

---

## 6. Checklist Tóm tắt cho Backend Developer

- [ ] Viết endpoint `GET /api/conversations/calls/active-incoming` trả về cuộc gọi đang chờ của user hiện tại.
- [ ] Viết endpoint `POST /api/conversations/{conversationId}/calls/reject` để xử lý khi người nhận từ chối cuộc gọi.
- [ ] Phát sự kiện SignalR `CallRejected` khi có người bấm từ chối.
- [ ] Thêm timeout 45s cho cuộc gọi: nếu không ai nghe thì giải phóng phòng và tạo tin nhắn hệ thống *"Cuộc gọi nhỡ"*.
- [ ] Phát sự kiện SignalR `MemberRemoved` khi xóa thành viên khỏi nhóm thay cho `ConversationUpdated` chung chung.
