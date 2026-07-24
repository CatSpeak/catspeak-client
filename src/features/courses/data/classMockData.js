export const MOCK_STUDENTS = [
  { id: "s1", fullName: "Nguyễn Văn A", email: "nguyenvana@gmail.com", phone: "0901234567", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80", attendance: "PRESENT" },
  { id: "s2", fullName: "Trần Thị B", email: "tranthib@gmail.com", phone: "0907654321", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80", attendance: "PRESENT" },
  { id: "s3", fullName: "Lê Hoàng C", email: "lehoangc@gmail.com", phone: "0912345678", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80&h=80", attendance: "ABSENT_EXCUSED" },
  { id: "s4", fullName: "Phạm Minh D", email: "phamminhd@gmail.com", phone: "0987654321", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=80&h=80", attendance: "ABSENT_UNEXCUSED" },
  { id: "s5", fullName: "Hoàng Thị E", email: "hoangthie@gmail.com", phone: "0934567890", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=80&h=80", attendance: "PRESENT" },
  { id: "s6", fullName: "Vũ Văn F", email: "vuvanf@gmail.com", phone: "0945678901", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=80&h=80", attendance: "PRESENT" },
  { id: "s7", fullName: "Đặng Thị G", email: "dangthig@gmail.com", phone: "0956789012", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=80&h=80", attendance: "ABSENT_EXCUSED" },
  { id: "s8", fullName: "Bùi Hoàng H", email: "buihoangh@gmail.com", phone: "0967890123", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=80&h=80", attendance: "PRESENT" },
  { id: "s9", fullName: "Đỗ Thị I", email: "dothii@gmail.com", phone: "0978901234", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=80&h=80", attendance: "PRESENT" },
  { id: "s10", fullName: "Ngô Văn K", email: "ngovank@gmail.com", phone: "0989012345", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=80&h=80", attendance: "PRESENT" }
]

export const MOCK_TEACHER = {
  fullName: "John Doe",
  email: "johndoe@catspeak.edu.vn",
  avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=80&h=80"
}

export const MOCK_FEED = [
  {
    id: "f1",
    author: "John Doe",
    role: "Lead Instructor",
    time: "2 hours ago",
    content: "Xin chào cả lớp, buổi học hôm nay chúng ta sẽ ôn tập từ vựng chủ đề Travel. Các bạn nhớ chuẩn bị bài nhé!",
    commentsCount: 3,
    likes: 5,
    isLiked: false
  },
  {
    id: "f2",
    author: "John Doe",
    role: "Lead Instructor",
    time: "Yesterday",
    content: "Tài liệu học tập của buổi 3 đã được cập nhật ở tab Tài liệu. Các bạn tải về để làm bài tập về nhà.",
    commentsCount: 1,
    likes: 8,
    isLiked: true
  },
  {
    id: "f3",
    author: "John Doe",
    role: "Lead Instructor",
    time: "3 days ago",
    content: "Nhắc nhở: Hạn nộp bài tập speaking là tối mai. Các bạn lưu ý nộp đúng hạn để mình chấm điểm.",
    commentsCount: 5,
    likes: 12,
    isLiked: false
  }
]