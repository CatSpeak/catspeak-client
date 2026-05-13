/**
 * Mock video data for the Video Reels page.
 *
 * Shape mirrors the expected API response so the UI can
 * swap to real data by simply changing the data source.
 *
 * @typedef {Object} VideoAuthor
 * @property {string} id
 * @property {string} name
 * @property {string} avatarUrl
 * @property {boolean} verified
 *
 * @typedef {Object} Video
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} thumbnailUrl
 * @property {string} videoUrl
 * @property {number} duration        - seconds
 * @property {number} views
 * @property {number} likes
 * @property {number} comments
 * @property {number} shares
 * @property {string} createdAt       - ISO 8601
 * @property {string[]} tags
 * @property {VideoAuthor} author
 * @property {"portrait"|"landscape"|"square"} orientation
 */

const MOCK_AUTHORS = [
  {
    id: "a1",
    name: "Sarah Chen",
    avatarUrl: "https://i.pravatar.cc/150?img=1",
    verified: true,
  },
  {
    id: "a2",
    name: "Marcus Williams",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
    verified: false,
  },
  {
    id: "a3",
    name: "Yuki Tanaka",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    verified: true,
  },
  {
    id: "a4",
    name: "Emma Thompson",
    avatarUrl: "https://i.pravatar.cc/150?img=9",
    verified: false,
  },
  {
    id: "a5",
    name: "Leo Martinez",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    verified: true,
  },
  {
    id: "a6",
    name: "Aisha Patel",
    avatarUrl: "https://i.pravatar.cc/150?img=16",
    verified: false,
  },
  {
    id: "a7",
    name: "David Kim",
    avatarUrl: "https://i.pravatar.cc/150?img=18",
    verified: true,
  },
  {
    id: "a8",
    name: "Olivia Brown",
    avatarUrl: "https://i.pravatar.cc/150?img=20",
    verified: false,
  },
]

const ORIENTATIONS = ["portrait", "portrait", "portrait", "landscape", "square"]

/**
 * ┌──────────────────────────────────────────────────────┐
 * │  VIDEO URLS — put your test / real video URLs here.  │
 * │  Each card cycles through this list by index.        │
 * │  Supports .mp4, .webm, or any browser-playable URL.  │
 * └──────────────────────────────────────────────────────┘
 *
 * Current URLs are free stock clips from Pexels / Pixabay CDNs.
 * Replace with your own API URLs when ready.
 */
const VIDEO_URLS = [
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://media.w3.org/2010/05/bunny/trailer.mp4",
  // "https://media.w3.org/2010/05/bunny/movie.mp4",
  "https://media.w3.org/2010/05/video/movie_300.mp4",
]

const TITLES = [
  "How to learn English with music 🎵",
  "5 phrases you NEED for traveling",
  "Morning routine in Tokyo ☀️",
  "My study setup tour",
  "Coding tips for beginners 💻",
  "Day in the life of a student",
  "Quick recipe: Matcha latte 🍵",
  "Travel vlog: Da Nang beach",
  "Language learning hack nobody talks about",
  "Sunset over the mountains 🌄",
  "How I improved my pronunciation",
  "Explore the hidden gems of Vietnam",
  "Study with me - 2 hour session",
  "Best apps for learning vocabulary",
  "Cat café visit in Saigon 🐱",
  "My favorite English idioms explained",
]

const DESCRIPTIONS = [
  "In this reel, I share my top tips for improving your English listening skills through music. It's easier than you think!",
  "These 5 essential travel phrases will help you navigate any English-speaking country with confidence.",
  "Follow along my peaceful morning routine in Tokyo. From sunrise views to a traditional Japanese breakfast.",
  "Here's a full tour of my productivity setup. Links to everything in the description!",
  "Starting your coding journey? Here are the tips I wish I knew when I was beginning.",
  "A typical day in my life as a university student in Ho Chi Minh City.",
  "Quick and easy matcha latte recipe that you can make at home in under 3 minutes.",
  "Exploring the beautiful beaches of Da Nang. This place is absolutely breathtaking!",
  "This unconventional language learning technique helped me achieve fluency in just 6 months.",
  "Captured this incredible sunset while hiking. Nature never ceases to amaze me.",
  "My journey from struggling with pronunciation to sounding natural in everyday conversations.",
  "Vietnam has so many hidden treasures. Let me show you some off-the-beaten-path destinations.",
  "Join me for a focused study session. Let's stay productive together!",
  "I've tried 50+ vocabulary apps and these are the only ones that actually work.",
  "The cutest cats I've ever seen! This café in Saigon is a must-visit.",
  "English idioms can be confusing. Here's a fun way to remember the most common ones.",
]

const TAGS_POOL = [
  "english",
  "learning",
  "travel",
  "lifestyle",
  "coding",
  "food",
  "vlog",
  "study",
  "tips",
  "vietnam",
  "japan",
  "motivation",
  "cats",
  "pronunciation",
  "vocabulary",
  "culture",
]

/**
 * Generate a deterministic list of mock videos.
 * @param {number} count - Number of videos to generate
 * @returns {Video[]}
 */
export const generateMockVideos = (count = 16) =>
  Array.from({ length: count }, (_, i) => {
    const authorIndex = i % MOCK_AUTHORS.length
    const orientationIndex = i % ORIENTATIONS.length
    const videoIndex = i % VIDEO_URLS.length

    return {
      id: `v${i + 1}`,
      title: TITLES[i % TITLES.length],
      description: DESCRIPTIONS[i % DESCRIPTIONS.length],
      videoUrl: VIDEO_URLS[videoIndex],
      duration: 15 + Math.floor(Math.random() * 45),
      views: Math.floor(1000 + Math.random() * 500000),
      likes: Math.floor(100 + Math.random() * 50000),
      comments: Math.floor(10 + Math.random() * 2000),
      shares: Math.floor(5 + Math.random() * 1000),
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 30) * 86400000,
      ).toISOString(),
      tags: [
        TAGS_POOL[(i * 3) % TAGS_POOL.length],
        TAGS_POOL[(i * 3 + 1) % TAGS_POOL.length],
        TAGS_POOL[(i * 3 + 2) % TAGS_POOL.length],
      ],
      author: MOCK_AUTHORS[authorIndex],
      orientation: ORIENTATIONS[orientationIndex],
    }
  })

/** Pre-built default dataset */
export const MOCK_VIDEOS = generateMockVideos(16)
