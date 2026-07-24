import { Cpu, Crown, User, Users } from "lucide-react"

export const slides = [
  {
    title: "Title của cái này",
    cta: "Tìm hiểu thêm",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Lớp Speaking nhóm nhỏ",
    cta: "Khám phá",
    image:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Workshop Debate",
    cta: "Đăng ký ngay",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  },
]

export const badges = [
  { id: "connect_1_1", label: "Queue 1:1", icon: User },
  { id: "connect_2_5", label: "Connect 2:5", icon: Users },
  { id: "custom_room", label: "Create Room", icon: Crown },
  { id: "your_ai", label: "AI", icon: Cpu },
]

export const roomFilters = [
  { label: "2 : 5", checked: true },
  { label: "Đã lưu" },
  { label: "Diễn đàn" },
]

export const topicsFilters = [
  ["Gia đình", "Thể thao"],
  ["Phim", "Du lịch"],
  ["Trường học", "Đồ đạc"],
  ["A1", "B2"],
  ["Khác"],
]

export const COLORS = [
  { value: "#BF156D", name: "Hồng" },
  { value: "#FAC126", name: "Vàng" },
  { value: "#990011", name: "Đỏ" },
  { value: "#00BB38", name: "Xanh lá" },
  { value: "#004AAD", name: "Xanh dương" },
  { value: "#FEAE13", name: "Cam" },
]
