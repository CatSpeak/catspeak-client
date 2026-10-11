Phase 3: Chat Enhancement - (@Mentions, Avatar người xem, In-chat LiveKit Call, Quản trị nhóm)
1. Danh sách REST API
Swagger API Spec: https://social-staging-api.catspeak.com.vn/swagger/index.html


Nhóm tính năng
	Phương thức & Endpoint
	Mô tả
	SignalR Event phát sinh
	@Mentions
	GET /api/conversations/{id}/members?query={q}
	Lấy danh sách thành viên hỗ trợ gợi ý autocomplete khi gõ @
	—
	@Mentions
	POST /api/conversations/{id}/messages
	Gửi tin nhắn có nhắc tên (@username, @all, @tatca)
	NewMessage (kèm MentionedAccountIds)
	Seen Avatars Stack
	GET /api/conversations/{id}/messages
	Lấy tin nhắn (mỗi tin nhắn trả về mảng ReadByUsers có avatar)
	—
	Seen Avatars Stack
	PUT /api/conversations/{id}/read
	Đánh dấu đã đọc tin nhắn
	MessageRead (kèm avatar & username)
	Quản trị nhóm
	PUT /api/conversations/{id}/group-info
	Đổi tên nhóm và ảnh đại diện nhóm (Owner/Admin)
	GroupUpdated
	Quản trị nhóm
	PUT /api/conversations/{id}/participants/{accountId}/promote
	Bổ nhiệm thành viên lên làm Phó nhóm (Chỉ Owner)
	MemberRoleChanged (role: "admin")
	Quản trị nhóm
	PUT /api/conversations/{id}/participants/{accountId}/demote
	Hạ cấp Phó nhóm về thành viên thường (Chỉ Owner)
	MemberRoleChanged (role: "member")
	Quản trị nhóm
	PUT /api/conversations/{id}/transfer-ownership
	Chuyển giao quyền Trưởng nhóm cho thành viên khác (Chỉ Owner)
	OwnershipTransferred
	Quản trị nhóm
	POST /api/conversations/{id}/leave
	Rời khỏi nhóm chat (Bắt buộc Trưởng nhóm chuyển giao trước)
	MemberLeft
	Quản trị nhóm
	DELETE /api/conversations/{id}/participants/{accountId}
	Xóa thành viên khỏi nhóm (Tuân thủ phân cấp vai trò)
	ConversationUpdated
	In-Chat LiveKit Call
	POST /api/conversations/{id}/calls/initiate
	Khởi tạo cuộc gọi thoại/video và nhận LiveKit JWT Token
	CallStarted
	In-Chat LiveKit Call
	POST /api/conversations/{id}/calls/join
	Tham gia vào cuộc gọi đang diễn ra và nhận LiveKit Token
	CallParticipantJoined
	In-Chat LiveKit Call
	POST /api/conversations/{id}/calls/end?forceEnd={bool}
	Rời cuộc gọi hoặc kết thúc cuộc gọi (tạo tin nhắn hệ thống ghi thời lượng)
	CallEnded hoặc CallParticipantLeft
	In-Chat LiveKit Call
	GET /api/conversations/{id}/calls/active
	Kiểm tra trạng thái cuộc gọi hiện tại và danh sách người đang trong phòng
	—
	2. Danh sách Sự kiện SignalR


STT
	Tên sự kiện (Event Name)
	Kênh nhận (SignalR Target)
	DTO Payload
	Mục đích & Xử lý Frontend
	1
	MessageRead(Nâng cấp)
	conversation_{conversationId}
	MessageReadEventDto
	Cập nhật tức thì vị trí Seen Avatars Stack dưới tin nhắn vừa đọc mà không cần reload
	2
	NewMessage(Nâng cấp)
	conversation_{conversationId}
	MessageDto (thêm MentionedAccountIds)
	Hiển thị tin nhắn mới, phát hiện @Mention đến người dùng hiện tại để rung chuông / highlight viền cam
	3
	GroupUpdated
	conversation_{conversationId}
	GroupUpdatedEventDto
	Cập nhật tức thì tên nhóm và ảnh đại diện nhóm trên Header chat và danh sách hội thoại
	4
	MemberRoleChanged
	conversation_{conversationId}
	MemberRoleChangedEventDto
	Cập nhật huy hiệu vai trò (Trưởng nhóm / Phó nhóm / Thành viên) và phân quyền các nút chức năng
	5
	OwnershipTransferred
	conversation_{conversationId}
	OwnershipTransferredEventDto
	Cập nhật Trưởng nhóm mới, chuyển quyền điều hành nhóm
	6
	MemberLeft
	conversation_{conversationId}
	MemberLeftEventDto
	Xóa thành viên khỏi danh sách hiển thị trong phòng
	7
	CallStarted
	conversation_{conversationId}
	CallStartedEventDto
	Hiển thị Rung chuông cuộc gọi đến / Banner gọi thoại/video kèm nút "Tham gia"
	8
	CallParticipantJoined
	conversation_{conversationId}
	CallParticipantJoinedEventDto
	Cập nhật thêm người tham gia vào danh sách phòng gọi LiveKit đang mở
	9
	CallParticipantLeft
	conversation_{conversationId}
	CallParticipantLeftEventDto
	Xóa người đã ngắt kết nối khỏi phòng gọi LiveKit
	10
	CallEnded
	conversation_{conversationId}
	CallEndedEventDto
	Đóng màn hình cuộc gọi, ẩn Call Banner, cập nhật tin nhắn hệ thống ghi lại thời lượng
	3. Chi tiết API & Nghiệp vụ
3.1. @Mentions Autocomplete & High-Priority Alerts
* Mục đích: Cho phép gõ @ trong ô chat để hiển thị danh sách thành viên autocomplete, gửi tin nhắn có highlight người được nhắc tên và gửi tín hiệu ưu tiên cao.
* Database & Entity: Đã bổ sung trường MentionedAccountIds kiểu mảng integer[] trong PostgreSQL thông qua Migration 20260926034135_AddChatMentions.cs.
* Endpoint Autocomplete:
   * GET /api/conversations/{conversationId}/members
   * Query Params: query (tùy chọn: tìm theo username hoặc nickname).
   * Response mẫu:


[
  {
    "accountId": 1,
    "username": "alice",
    "fullName": "Alice Nguyễn",
    "avatarImageUrl": "https://...",
    "isOwner": true,
    "isAdmin": true,
    "isOnline": true,
    "joinedAt": "2026-09-26T03:00:00Z"
  }
]
* Endpoint Gửi tin nhắn:
   * POST /api/conversations/{conversationId}/messages
   * Request Body mẫu:


{
  "messageContent": "Chào @alice và @all nhé!",
  "messageType": 0,
  "mentionedAccountIds": [1] // Tùy chọn, nếu client không truyền BE sẽ tự động Regex parse
}
   * Real-time SignalR: Sự kiện NewMessage bắn ra chứa MentionedAccountIds. Frontend kiểm tra nếu ID của mình nằm trong danh sách này thì hiển thị badge highlight vàng/cam và phát âm thanh chuông thông báo ưu tiên.
3.2. Stack Avatar người đã xem (Seen Avatars Stack)
* Mục đích: Hiển thị hàng avatar tròn nhỏ chồng lớp (stacked avatars) dưới chân tin nhắn cuối cùng mà từng thành viên đã đọc (giống Messenger, Telegram, Slack).
* Endpoint Lấy tin nhắn:
   * GET /api/conversations/{conversationId}/messages
   * Cải tiến Response: Trong mỗi MessageDto nay đã tích hợp danh sách ReadByUsers:


{
  "messageId": 105,
  "messageContent": "Mọi người đã chuẩn bị xong chưa?",
  "readByUsers": [
    {
      "accountId": 2,
      "username": "bob",
      "fullName": "Bob Trần",
      "avatarImageUrl": "https://..."
    }
  ]
}
* Endpoint Đánh dấu đã đọc:
   * PUT /api/conversations/{conversationId}/read
   * Real-time SignalR Event MessageRead: Bắn ra cho toàn bộ phòng chat với đầy đủ thông tin:


{
  "conversationId": 10,
  "accountId": 2,
  "username": "bob",
  "avatarImageUrl": "https://...",
  "lastReadMessageId": 105,
  "timestamp": "2026-09-26T03:45:00Z"
}
   * Frontend chỉ cần nghe sự kiện này và di chuyển avatar của bob đến dưới chân messageId: 105 tức thì mà không cần reload tin nhắn.
3.3. Quản trị nhóm nâng cao (Group Governance & Permissions)
* Phân cấp quyền hạn chặt chẽ:
   1. Trưởng nhóm (Owner): Toàn quyền. Duy nhất Owner mới có quyền bổ nhiệm/hạ cấp Phó nhóm, chuyển quyền Trưởng nhóm, giải tán nhóm.
   2. Phó nhóm (Admin): Được đổi tên/avatar nhóm, xóa thành viên thường. Không được xóa Owner hoặc Phó nhóm khác.
   3. Thành viên thường (Member): Nhắn tin, xem danh sách, rời nhóm.
* Các Endpoints chi tiết:
   1. Đổi thông tin nhóm (Tên & Avatar):
      * PUT /api/conversations/{conversationId}/group-info
      * Body: {"groupName": "Team Frontend CatSpeak", "groupAvatar": "https://..."}
      * Quyền: Owner hoặc Admin.
      * SignalR: Broadcast GroupUpdated đến toàn bộ thành viên.
   2. Bổ nhiệm Phó nhóm:
      * PUT /api/conversations/{conversationId}/participants/{accountId}/promote
      * Quyền: Duy nhất Owner.
      * SignalR: Broadcast MemberRoleChanged (role: "admin").
   3. Hạ cấp Phó nhóm:
      * PUT /api/conversations/{conversationId}/participants/{accountId}/demote
      * Quyền: Duy nhất Owner.
      * SignalR: Broadcast MemberRoleChanged (role: "member").
   4. Chuyển giao quyền Trưởng nhóm:
      * PUT /api/conversations/{conversationId}/transfer-ownership
      * Body: {"newOwnerAccountId": 2}
      * Quyền: Duy nhất Owner hiện tại.
      * SignalR: Broadcast OwnershipTransferred và tự động gửi tin nhắn hệ thống ghi nhận.
   5. Rời nhóm chat:
      * POST /api/conversations/{conversationId}/leave
      * Quy tắc an toàn: Trưởng nhóm không thể rời nhóm khi vẫn còn các thành viên khác (bắt buộc phải chuyển giao quyền Trưởng nhóm trước).
      * SignalR: Broadcast MemberLeft và tạo tin nhắn hệ thống "Alice đã rời khỏi nhóm.".
   6. Xóa thành viên (Kick Member):
      * DELETE /api/conversations/{conversationId}/participants/{accountId}
      * Quy tắc: Admin chỉ có thể xóa Member; không ai có thể xóa Owner.
3.4. Gọi thoại & Gọi video trong Chat qua LiveKit (In-Chat Calling)
* Mục đích: Tích hợp gọi thoại (audio) hoặc gọi video (video) trực tiếp ngay trong cuộc trò chuyện (hỗ trợ cả chat 1-1 và chat nhóm nhiều người) thông qua hạ tầng LiveKit WebRTC của hệ sinh thái CatSpeak.
* Kiến trúc:
   1. ILiveKitChatTokenService: Sinh JWT token bảo mật HMAC-SHA256 chuẩn LiveKit chứa đầy đủ video grants (roomJoin, canPublish, canSubscribe, canPublishData), kết nối tới LiveKit Server (wss://livekit2.catspeak.com.vn).
   2. IChatCallManager: Quản lý vòng đời trạng thái cuộc gọi in-memory ConcurrentDictionary, theo dõi danh sách người đang trong cuộc gọi, thời gian bắt đầu, thời lượng cuộc gọi.
* Các Endpoints chi tiết:
   1. Khởi tạo cuộc gọi:
      * POST /api/conversations/{conversationId}/calls/initiate
      * Body: {"callType": "video"} (hoặc "audio")
      * Response mẫu:


{
  "callId": "d98f7e2a-...",
  "conversationId": 10,
  "roomName": "call_10_1727322300000",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "serverUrl": "wss://livekit2.catspeak.com.vn",
  "callType": "video",
  "startedAt": "2026-09-26T03:50:00Z"
}
      * SignalR: Broadcast CallStarted tới toàn bộ thành viên trong cuộc hội thoại để hiển thị thanh banner thông báo "Alice đang gọi video..." kèm nút Tham gia (Join).
   2. Tham gia cuộc gọi đang diễn ra:
      * POST /api/conversations/{conversationId}/calls/join
      * Response: Trả về CallTokenResponseDto cùng roomName và token của người tham gia.
      * SignalR: Broadcast CallParticipantJoined để các client khác cập nhật danh sách người trong phòng.
   3. Rời hoặc Kết thúc cuộc gọi:
      * POST /api/conversations/{conversationId}/calls/end?forceEnd=false
      * Logic xử lý:
         * Nếu là người khởi tạo hoặc người cuối cùng rời phòng: Cuộc gọi chuyển sang ended, giải phóng phòng và tự động gửi tin nhắn hệ thống ghi lại lịch sử cuộc gọi: "Cuộc gọi video đã kết thúc • 15 phút 20 giây". Phát sự kiện CallEnded.
         * Nếu là người tham gia rời khi vẫn còn người khác: Chỉ người đó rời, phát sự kiện CallParticipantLeft.
   4. Lấy thông tin cuộc gọi đang hoạt động:
      * GET /api/conversations/{conversationId}/calls/active
      * Response: Trả về ActiveCallDto (bao gồm callId, callType, participants, startedAt) hoặc null nếu không có cuộc gọi nào. Giúp Frontend render header call banner khi user vừa mở app hoặc chuyển màn hình chat.
4. Gợi ý Kế hoạch Thiết kế Giao diện & Trải nghiệm (Frontend)
4.1. Cải tiến Thanh công cụ & Nhập liệu (ChatInput.jsx)
1. Hệ thống Gợi ý Nhắc tên (@Mentions):
   * Khi người dùng gõ ký tự @: Mở popup nhỏ ngay phía trên vị trí con trỏ chuột.
   * Liệt kê danh sách thành viên trong nhóm kèm Avatar và Tên (có tùy chọn @All / @Tất cả nếu là Admin).
   * Hỗ trợ phím mũi tên Lên/Xuống và Enter để chọn nhanh.
   * Textarea chèn cú pháp @Username.
   * Gợi ý @Mentions: Khi người dùng gõ @, gọi GET /api/conversations/{conversationId}/members?query={keyword} để render menu popup gợi ý.
4.2. Nâng cấp Bong bóng tin nhắn (ChatBubble.jsx, ChatBubbleActions.jsx)
1. Cụm Avatar người đã xem trong nhóm (Seen Avatars Stack):
   * Thay vì chỉ có 1 tích xanh đơn điệu: Ở cuối tin nhắn tương ứng với vị trí đã đọc của từng người, hiển thị một hàng các avatar tròn siêu nhỏ (16x16px) của các thành viên.
   * Giúp người gửi biết chính xác ai đã đọc đến tin nhắn nào như Facebook Messenger.
   * Seen Stack Avatars: Lấy mảng readByUsers trong từng item của GET /api/conversations/{conversationId}/messages để render các avatar tròn đè lên nhau ở góc dưới tin nhắn; lắng nghe sự kiện SignalR MessageRead để cập nhật vị trí avatar tức thì.
4.3. Nâng cấp Khu vực Cuộc trò chuyện & Tiêu đề (ChatHeader.jsx, ChatArea.jsx)
4.4. Nâng cấp Bảng thông tin phải (ChatUserPanel.jsx)
* Thiết kế hệ thống Tabs hiện đại giống Zalo / Messenger:
   * Tab Thông tin & Thành viên (Info & Members):
      * Thông tin nhóm/bạn bè, danh sách thành viên, cấp quyền Admin, thêm/xóa thành viên, đổi tên/avatar nhóm.
      * Quản trị nhóm: Dựa vào isOwner và isAdmin từ GET /api/conversations/{conversationId}/members để ẩn/hiện nút "Bổ nhiệm Phó nhóm", "Chuyển giao Trưởng nhóm", "Đổi tên nhóm", "Xóa thành viên".
4.5. Gọi LiveKit (In-Chat Calling UI)
1. Khi ấn nút Gọi thoại / Gọi video: gọi POST /api/conversations/{conversationId}/calls/initiate, lấy token và serverUrl truyền vào component <LiveKitRoom>.
Lắng nghe sự kiện SignalR CallStarted để hiển thị popup rung chuông cuộc gọi đến cho các thành viên khác. Khi người dùng bấm "Nghe", gọi POST /api/conversations/{conversationId}/calls/join để kết nối vào phòng.