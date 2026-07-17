/**
 * Chat Feature — Mock Data
 * Rich mock data for the fullscreen chat page.
 * Supports both 1:1 (direct) and group conversations.
 */

// ── Time helpers ──────────────────────────────────────────
const now = Date.now()
const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const ago = (ms) => new Date(now - ms).toISOString()

// ── Current User ──────────────────────────────────────────
export const currentUser = {
  id: "me",
  name: "Minh Nguyen",
  avatar: null,
  status: "online",
  about: "Building CatSpeak 🐱",
}

// ── Users ─────────────────────────────────────────────────
export const users = {
  u1: {
    id: "u1",
    name: "Sarah Chen",
    avatar: null,
    status: "online",
    about: "Product Designer at CatSpeak",
    lastSeen: null,
  },
  u2: {
    id: "u2",
    name: "Alex Rivera",
    avatar: null,
    status: "offline",
    about: "Full-stack Developer",
    lastSeen: ago(2 * HOUR),
  },
  u3: {
    id: "u3",
    name: "Emma Watson",
    avatar: null,
    status: "online",
    about: "Marketing Lead — CatSpeak APAC",
    lastSeen: null,
  },
  u4: {
    id: "u4",
    name: "James Park",
    avatar: null,
    status: "away",
    about: "DevOps Engineer | 🔧",
    lastSeen: null,
  },
  u5: {
    id: "u5",
    name: "Luna Tran",
    avatar: null,
    status: "online",
    about: "UX Researcher",
    lastSeen: null,
  },
  u6: {
    id: "u6",
    name: "David Kim",
    avatar: null,
    status: "offline",
    about: "Backend Developer",
    lastSeen: ago(1 * DAY),
  },
  u7: {
    id: "u7",
    name: "Mei Lin",
    avatar: null,
    status: "online",
    about: "Project Manager",
    lastSeen: null,
  },
  u8: {
    id: "u8",
    name: "Tom Harris",
    avatar: null,
    status: "offline",
    about: "QA Engineer",
    lastSeen: ago(3 * HOUR),
  },
}

// ── Conversations ─────────────────────────────────────────
export const conversations = [
  {
    id: "c1",
    type: "direct",
    participants: ["me", "u1"],
    unreadCount: 2,
    pinned: true,
    muted: false,
    typing: ["u1"],
  },
  {
    id: "c2",
    type: "group",
    name: "CatSpeak Design Team",
    participants: ["me", "u1", "u3", "u5", "u7"],
    unreadCount: 5,
    pinned: true,
    muted: false,
    typing: [],
  },
  {
    id: "c3",
    type: "direct",
    participants: ["me", "u2"],
    unreadCount: 0,
    pinned: false,
    muted: false,
    typing: [],
  },
  {
    id: "c4",
    type: "direct",
    participants: ["me", "u4"],
    unreadCount: 1,
    pinned: false,
    muted: false,
    typing: [],
  },
  {
    id: "c5",
    type: "group",
    name: "Project Alpha",
    participants: ["me", "u2", "u4", "u6", "u8"],
    unreadCount: 3,
    pinned: false,
    muted: false,
    typing: [],
  },
  {
    id: "c6",
    type: "direct",
    participants: ["me", "u5"],
    unreadCount: 0,
    pinned: false,
    muted: false,
    typing: [],
  },
  {
    id: "c7",
    type: "direct",
    participants: ["me", "u6"],
    unreadCount: 0,
    pinned: false,
    muted: true,
    typing: [],
  },
  {
    id: "c8",
    type: "group",
    name: "English Study Group",
    participants: ["me", "u3", "u5", "u7", "u8"],
    unreadCount: 0,
    pinned: false,
    muted: false,
    typing: [],
  },
]

// ── Messages ──────────────────────────────────────────────
export const messages = {
  // ─── c1: Sarah Chen (Direct) ────────────────────────────
  c1: [
    { id: "c1m1", senderId: "me", content: "Hey Sarah! Have you finished the new dashboard mockups?", timestamp: ago(2 * DAY + 4 * HOUR), status: "read" },
    { id: "c1m2", senderId: "u1", content: "Hey! Yes, I just uploaded them to Figma. Let me share the link 🎨", timestamp: ago(2 * DAY + 3 * HOUR + 55 * MINUTE), status: "read" },
    { id: "c1m3", senderId: "u1", content: "https://figma.com/file/catspeak-dashboard-v3", timestamp: ago(2 * DAY + 3 * HOUR + 54 * MINUTE), status: "read" },
    { id: "c1m4", senderId: "me", content: "This looks amazing! Love the new card layout. The color gradient on the sidebar is really clean.", timestamp: ago(2 * DAY + 3 * HOUR), status: "read" },
    { id: "c1m5", senderId: "u1", content: "Thanks! I spent a lot of time on the color palette. Wanted to keep it consistent with our brand.", timestamp: ago(2 * DAY + 2 * HOUR + 50 * MINUTE), status: "read" },
    { id: "c1m6", senderId: "me", content: "One thing — can we make the navigation icons slightly larger? They feel a bit small on tablet.", timestamp: ago(1 * DAY + 5 * HOUR), status: "read" },
    { id: "c1m7", senderId: "u1", content: "Good catch! I'll update those. Also, should we add a dark mode toggle to the header?", timestamp: ago(1 * DAY + 4 * HOUR + 45 * MINUTE), status: "read" },
    { id: "c1m8", senderId: "me", content: "Definitely yes. Dark mode is a must-have. Can you prototype both themes?", timestamp: ago(1 * DAY + 4 * HOUR + 30 * MINUTE), status: "read" },
    { id: "c1m9", senderId: "u1", content: "On it! I'll have the dark mode version ready by tomorrow.", timestamp: ago(1 * DAY + 4 * HOUR + 25 * MINUTE), status: "read" },
    { id: "c1m10", senderId: "me", content: "Perfect. Also, the team wants to discuss the chat feature design in tomorrow's standup. Can you prepare a quick overview?", timestamp: ago(3 * HOUR), status: "read" },
    { id: "c1m11", senderId: "u1", content: "Sure thing! I actually have some wireframes ready for the chat page. Want a sneak peek? 👀", timestamp: ago(8 * MINUTE), status: "delivered" },
    { id: "c1m12", senderId: "u1", content: "I went with a Messenger-style layout — sidebar + main chat area. What do you think?", timestamp: ago(5 * MINUTE), status: "delivered" },
  ],

  // ─── c2: CatSpeak Design Team (Group) ───────────────────
  c2: [
    { id: "c2m1", senderId: "u7", content: "Hey team! Quick update on the Q3 roadmap. I've added the new chat feature to our sprint board.", timestamp: ago(1 * DAY + 6 * HOUR), status: "read" },
    { id: "c2m2", senderId: "u1", content: "Great! I've already started on the wireframes. Should have something to share by EOD.", timestamp: ago(1 * DAY + 5 * HOUR + 45 * MINUTE), status: "read" },
    { id: "c2m3", senderId: "u3", content: "Awesome! From a marketing perspective, the chat feature is one of our most requested features. Users keep asking for it.", timestamp: ago(1 * DAY + 5 * HOUR + 30 * MINUTE), status: "read" },
    { id: "c2m4", senderId: "u5", content: "I ran a quick survey last week — 78% of users said real-time messaging would make them use the platform more often. The data is very compelling.", timestamp: ago(1 * DAY + 5 * HOUR), status: "read" },
    { id: "c2m5", senderId: "me", content: "That's really strong signal. Let's make sure we nail the MVP. Group chat support is essential from day one.", timestamp: ago(1 * DAY + 4 * HOUR + 40 * MINUTE), status: "read" },
    { id: "c2m6", senderId: "u7", content: "Agreed. I've scheduled a design review for Thursday. @Sarah will present the wireframes.", timestamp: ago(1 * DAY + 4 * HOUR + 20 * MINUTE), status: "read" },
    { id: "c2m7", senderId: "u1", content: "Sounds good! I'll prepare a prototype in Figma with interactive flows 🎯", timestamp: ago(1 * DAY + 4 * HOUR), status: "read" },
    { id: "c2m8", senderId: "u3", content: "Can we also discuss the notification strategy? Push notifications, in-app badges, email digests — we need to plan all of this.", timestamp: ago(25 * MINUTE), status: "delivered" },
    { id: "c2m9", senderId: "u5", content: "Good point, Emma. I have some UX patterns from competitors we can reference.", timestamp: ago(18 * MINUTE), status: "delivered" },
    { id: "c2m10", senderId: "u7", content: "Let's add that to the agenda. Also, should we consider voice messages for v1?", timestamp: ago(10 * MINUTE), status: "delivered" },
  ],

  // ─── c3: Alex Rivera (Direct) ──────────────────────────
  c3: [
    { id: "c3m1", senderId: "u2", content: "Hey Minh, I found a weird bug in the API middleware. The auth token isn't refreshing correctly on 401 responses.", timestamp: ago(3 * DAY + 2 * HOUR), status: "read" },
    { id: "c3m2", senderId: "me", content: "Oh no, that could affect all authenticated endpoints. Can you share the error log?", timestamp: ago(3 * DAY + 1 * HOUR + 50 * MINUTE), status: "read" },
    { id: "c3m3", senderId: "u2", content: "The issue is in the interceptor. It's trying to refresh the token but the refresh endpoint returns a 403 because the refresh token itself is expired.", timestamp: ago(3 * DAY + 1 * HOUR + 40 * MINUTE), status: "read" },
    { id: "c3m4", senderId: "me", content: "Ah I see. We need to add a check — if the refresh token is also expired, redirect to login instead of looping.", timestamp: ago(3 * DAY + 1 * HOUR + 30 * MINUTE), status: "read" },
    { id: "c3m5", senderId: "u2", content: "Exactly! I'll push a fix today. Also, I refactored the RTK Query base query to be cleaner.", timestamp: ago(3 * DAY + 1 * HOUR + 20 * MINUTE), status: "read" },
    { id: "c3m6", senderId: "me", content: "Awesome, thanks for catching that. Let me know when the PR is up and I'll review it.", timestamp: ago(3 * DAY + 1 * HOUR + 10 * MINUTE), status: "read" },
    { id: "c3m7", senderId: "u2", content: "PR is up! #247. Also added unit tests for the token refresh flow 🧪", timestamp: ago(3 * DAY + 30 * MINUTE), status: "read" },
    { id: "c3m8", senderId: "me", content: "Nice, I'll check it out now. Great work on the tests too! 💪", timestamp: ago(3 * DAY + 20 * MINUTE), status: "read" },
  ],

  // ─── c4: James Park (Direct) ───────────────────────────
  c4: [
    { id: "c4m1", senderId: "me", content: "Hey James, how's the staging deployment going?", timestamp: ago(5 * HOUR), status: "read" },
    { id: "c4m2", senderId: "u4", content: "Mostly done! Had a small hiccup with the Docker compose config but it's resolved now.", timestamp: ago(4 * HOUR + 50 * MINUTE), status: "read" },
    { id: "c4m3", senderId: "me", content: "Good to hear. Can we do a smoke test this afternoon?", timestamp: ago(4 * HOUR + 30 * MINUTE), status: "read" },
    { id: "c4m4", senderId: "u4", content: "Sure, I'll set up the test environment. One thing though — we need to update the SSL cert before next week.", timestamp: ago(4 * HOUR + 20 * MINUTE), status: "read" },
    { id: "c4m5", senderId: "me", content: "Right, I'll create a ticket for that. Let's prioritize it.", timestamp: ago(4 * HOUR + 10 * MINUTE), status: "read" },
    { id: "c4m6", senderId: "u4", content: "Heads up — I noticed the staging server memory usage spiked to 85%. Might want to look into it.", timestamp: ago(30 * MINUTE), status: "delivered" },
  ],

  // ─── c5: Project Alpha (Group) ─────────────────────────
  c5: [
    { id: "c5m1", senderId: "u6", content: "Team, I've optimized the database queries for the feed. Response time dropped from 800ms to 120ms 🚀", timestamp: ago(2 * DAY + 1 * HOUR), status: "read" },
    { id: "c5m2", senderId: "u4", content: "That's incredible! What did you change?", timestamp: ago(2 * DAY + 50 * MINUTE), status: "read" },
    { id: "c5m3", senderId: "u6", content: "Added proper indexes, rewrote the JOIN queries, and implemented cursor-based pagination instead of offset.", timestamp: ago(2 * DAY + 40 * MINUTE), status: "read" },
    { id: "c5m4", senderId: "me", content: "Amazing work David! This will make a huge difference for user experience.", timestamp: ago(2 * DAY + 30 * MINUTE), status: "read" },
    { id: "c5m5", senderId: "u8", content: "I'll run the performance test suite against these changes. Should have results by tomorrow.", timestamp: ago(2 * DAY + 20 * MINUTE), status: "read" },
    { id: "c5m6", senderId: "u2", content: "Nice one David! I'll update the frontend to use cursor pagination.", timestamp: ago(45 * MINUTE), status: "delivered" },
    { id: "c5m7", senderId: "u4", content: "Also, should we discuss the caching strategy? I think we can add Redis for the hot queries.", timestamp: ago(35 * MINUTE), status: "delivered" },
    { id: "c5m8", senderId: "u8", content: "Good idea. Let me benchmark the current vs cached response times first.", timestamp: ago(20 * MINUTE), status: "delivered" },
  ],

  // ─── c6: Luna Tran (Direct) ────────────────────────────
  c6: [
    { id: "c6m1", senderId: "u5", content: "Hi Minh! Sharing some interesting findings from our latest user research session.", timestamp: ago(1 * DAY + 8 * HOUR), status: "read" },
    { id: "c6m2", senderId: "u5", content: "Users love the community rooms feature, but they want more ways to connect — private messaging, group chats, file sharing.", timestamp: ago(1 * DAY + 7 * HOUR + 50 * MINUTE), status: "read" },
    { id: "c6m3", senderId: "me", content: "This aligns perfectly with what we're building! Did they mention any specific pain points?", timestamp: ago(1 * DAY + 7 * HOUR + 30 * MINUTE), status: "read" },
    { id: "c6m4", senderId: "u5", content: "The main complaint is that there's no way to continue conversations outside of video calls. They want to follow up async.", timestamp: ago(1 * DAY + 7 * HOUR + 20 * MINUTE), status: "read" },
    { id: "c6m5", senderId: "me", content: "Makes total sense. The chat feature will solve exactly that. Can you write up a summary for the team?", timestamp: ago(1 * DAY + 7 * HOUR), status: "read" },
    { id: "c6m6", senderId: "u5", content: "Already on it! I'll include user quotes and the heatmap data from the session recordings.", timestamp: ago(1 * DAY + 6 * HOUR + 50 * MINUTE), status: "read" },
    { id: "c6m7", senderId: "me", content: "Perfect, thanks Luna! Your research always gives us great direction 🙏", timestamp: ago(1 * DAY + 6 * HOUR + 40 * MINUTE), status: "read" },
  ],

  // ─── c7: David Kim (Direct) ────────────────────────────
  c7: [
    { id: "c7m1", senderId: "u6", content: "Minh, quick question about the database schema for the chat feature.", timestamp: ago(5 * DAY + 2 * HOUR), status: "read" },
    { id: "c7m2", senderId: "me", content: "Sure, what's up?", timestamp: ago(5 * DAY + 1 * HOUR + 50 * MINUTE), status: "read" },
    { id: "c7m3", senderId: "u6", content: "Should we use a separate Messages table with a foreign key to Conversations, or embed messages in a NoSQL document?", timestamp: ago(5 * DAY + 1 * HOUR + 40 * MINUTE), status: "read" },
    { id: "c7m4", senderId: "me", content: "I think a relational approach is better for our use case. Separate tables with proper indexing for conversation lookups.", timestamp: ago(5 * DAY + 1 * HOUR + 20 * MINUTE), status: "read" },
    { id: "c7m5", senderId: "u6", content: "Agreed. I'll set up the migration scripts. We can always add a cache layer on top later.", timestamp: ago(5 * DAY + 1 * HOUR), status: "read" },
  ],

  // ─── c8: English Study Group (Group) ───────────────────
  c8: [
    { id: "c8m1", senderId: "u3", content: "Hey everyone! Who's up for a study session this weekend? 📚", timestamp: ago(2 * DAY + 8 * HOUR), status: "read" },
    { id: "c8m2", senderId: "u5", content: "I'm in! Should we focus on IELTS speaking practice?", timestamp: ago(2 * DAY + 7 * HOUR + 30 * MINUTE), status: "read" },
    { id: "c8m3", senderId: "u7", content: "Sounds great! I need to practice Part 2 — the cue card topics always trip me up 😅", timestamp: ago(2 * DAY + 7 * HOUR), status: "read" },
    { id: "c8m4", senderId: "u8", content: "Count me in. Can we also do some vocabulary review? I found a great resource.", timestamp: ago(2 * DAY + 6 * HOUR + 30 * MINUTE), status: "read" },
    { id: "c8m5", senderId: "me", content: "I'll set up a CatSpeak room for Saturday 10 AM. We can use the video call feature!", timestamp: ago(2 * DAY + 6 * HOUR), status: "read" },
    { id: "c8m6", senderId: "u3", content: "Perfect! I'll prepare some discussion topics. See you all Saturday! 🎉", timestamp: ago(2 * DAY + 5 * HOUR + 30 * MINUTE), status: "read" },
  ],
}

// ── Utility Functions ─────────────────────────────────────

/**
 * Get a consistent color for a user ID (used for group chat sender names).
 */
const userColorPalette = [
  "#990011", "#2563EB", "#059669", "#D97706", "#7C3AED",
  "#DB2777", "#0891B2", "#4F46E5", "#CA8A04", "#15803D",
]

export const getUserColor = (userId) => {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return userColorPalette[Math.abs(hash) % userColorPalette.length]
}

/**
 * Get display name for a conversation.
 */
export const getConversationName = (conversation, usersMap) => {
  if (conversation.type === "group") return conversation.name
  const otherId = conversation.participants.find((id) => id !== "me")
  return usersMap[otherId]?.name || "Unknown"
}

/**
 * Get the "other" user in a 1:1 conversation.
 */
export const getOtherUser = (conversation, usersMap) => {
  if (conversation.type !== "direct") return null
  const otherId = conversation.participants.find((id) => id !== "me")
  return usersMap[otherId] || null
}

/**
 * Format a timestamp as a short relative string for the sidebar.
 * e.g. "Just now", "5m", "2h", "Yesterday", "Mon", "Jul 10"
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return ""
  const date = new Date(timestamp)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / (60 * 1000))
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000))
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7)
    return date.toLocaleDateString(undefined, { weekday: "short" })
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

/**
 * Format a date label for date separators in the chat area.
 * e.g. "Today", "Yesterday", "Monday, July 14, 2026"
 */
export const formatDateSeparator = (timestamp) => {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}
