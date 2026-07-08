export const mockRoundResult = {
  roundNumber: 2,
  totalRounds: 4,
  countdown: 3,
  image: {
    url: "https://picsum.photos/seed/catspeak/800/600",
    category: "Animals",
  },
  describer: {
    id: "user-001",
    name: "Nguyễn Cương",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=cuong",
  },
  roundScore: 87,
  averageRating: 4.3,
  language: "English",
  difficulty: "Medium",
  validRatings: 5,
  leaderboard: [
    {
      id: "user-001",
      name: "Nguyễn Cương",
      avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=cuong",
      rank: 1,
      totalScore: 234,
      scoreIncrease: 87,
    },
    {
      id: "user-002",
      name: "Trần Minh",
      avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=minh",
      rank: 2,
      totalScore: 198,
      scoreIncrease: 64,
    },
    {
      id: "user-003",
      name: "Phạm Bảo Long",
      avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=long",
      rank: 3,
      totalScore: 175,
      scoreIncrease: 71,
    },
    {
      id: "user-005",
      name: "Võ Nguyễn Thị Lan",
      avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=lan",
      rank: 4,
      totalScore: 142,
      scoreIncrease: 55,
    },
    {
      id: "user-006",
      name: "Vũ Thị Mai",
      avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=mai",
      rank: 5,
      totalScore: 118,
      scoreIncrease: 48,
    },
    {
      id: "user-007",
      name: "Vũ Thị Đà",
      avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=da",
      rank: 6,
      totalScore: 95,
      scoreIncrease: 32,
    },
    {
      id: "user-008",
      name: "Vũ Thị Vũ",
      avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=vu",
      rank: 7,
      totalScore: 80,
      scoreIncrease: 20,
    },
  ],
}

/** Danh sách ảnh giả cho các rounds */
export const mockImages = [
  { url: "https://picsum.photos/seed/cat1/800/600", category: "Animals" },
  { url: "https://picsum.photos/seed/city2/800/600", category: "Architecture" },
  { url: "https://picsum.photos/seed/food3/800/600", category: "Food" },
  { url: "https://picsum.photos/seed/nature4/800/600", category: "Nature" },
]

/** Từ cấm mẫu theo từng category */
export const mockForbiddenWords = {
  Animals: ["cat", "dog", "animal", "pet", "fur"],
  Architecture: ["building", "house", "structure", "floor", "wall"],
  Food: ["eat", "food", "dish", "meal", "cook"],
  Nature: ["tree", "green", "plant", "nature", "forest"],
}
