/**
 * Mock Student Database and Service Layer
 * Simulates API interactions for student courses, classes, and enrollments.
 * Persists data to LocalStorage to maintain state across reloads.
 */

const STORAGE_KEYS = {
  COURSES: "catspeak_student_courses",
  CLASSES: "catspeak_student_classes",
  ENROLLMENTS: "catspeak_student_enrollments",
}

// Initial mock data definitions
const INITIAL_COURSES = [
  {
    id: "c-chinese",
    title: "Intermediate Chinese Conversation",
    language: "Chinese",
    levels: ["HSK3", "HSK4"],
    description: "Master daily conversations and express opinions fluently in Mandarin. Focuses on vocabulary expansion, idiomatic expressions, and tone correction.",
    whatYouWillLearn: [
      "Conduct conversations on common professional and social topics.",
      "Expand vocabulary to 1200+ characters.",
      "Understand and use advanced sentence structures.",
      "Pronounce tones with native-like accuracy."
    ],
    instructorName: "Prof. Chen Wei",
    instructorTitle: "Senior Mandarin Lecturer",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    totalSessions: 24,
    classCount: 2,
    studentCount: 15,
    status: "OPEN",
    startDate: "2026-07-15",
    endDate: "2026-09-10",
    priceRange: { min: 2500000, max: 2800000 },
    thumbnailUrl: "",
    createdAt: "2026-06-01T08:00:00Z"
  },
  {
    id: "c-english-biz",
    title: "Business English Masterclass",
    language: "English",
    levels: ["B2", "C1"],
    description: "Elevate your professional communication. Learn to write persuasive emails, run effective meetings, pitch ideas, and negotiate confidently in international business settings.",
    whatYouWillLearn: [
      "Draft professional correspondence, reports, and proposals.",
      "Lead cross-border meetings and present complex data.",
      "Use negotiation tactics and phrases in English.",
      "Understand cultural nuances in business communications."
    ],
    instructorName: "Sarah Jenkins",
    instructorTitle: "Corporate Coach & MBA",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    totalSessions: 16,
    classCount: 2,
    studentCount: 22,
    status: "OPEN",
    startDate: "2026-07-20",
    endDate: "2026-09-15",
    priceRange: { min: 3200000, max: 3500000 },
    thumbnailUrl: "",
    createdAt: "2026-06-05T10:30:00Z"
  },
  {
    id: "c-japanese-beg",
    title: "Japanese for Beginners (N5)",
    language: "Japanese",
    levels: ["N5"],
    description: "Start your Japanese language journey. Build a strong foundation in Hiragana, Katakana, basic grammar, and useful everyday expressions for travel and basic interactions.",
    whatYouWillLearn: [
      "Read and write Hiragana and Katakana characters.",
      "Introduce yourself and hold simple daily conversations.",
      "Understand essential Japanese grammar structures.",
      "Master vocabulary for traveling and ordering food."
    ],
    instructorName: "Kenji Sato",
    instructorTitle: "Japanese Language Instructor",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    totalSessions: 30,
    classCount: 1,
    studentCount: 8,
    status: "OPEN",
    startDate: "2026-07-25",
    endDate: "2026-10-15",
    priceRange: { min: 1800000, max: 1800000 },
    thumbnailUrl: "",
    createdAt: "2026-06-10T14:15:00Z"
  },
  {
    id: "c-ielts-writing",
    title: "IELTS Academic Writing Lab",
    language: "English",
    levels: ["B2", "C1"],
    description: "Intensive training for IELTS Writing Task 1 and Task 2. Analyze samples, master essay templates, learn vocabulary for graphs, and receive step-by-step guidance to achieve band 7.0+.",
    whatYouWillLearn: [
      "Structure high-scoring Task 1 and Task 2 responses.",
      "Interpret and describe complex visual charts and tables.",
      "Develop well-supported arguments for debate topics.",
      "Avoid common grammatical errors and vocabulary repetitions."
    ],
    instructorName: "Arthur Pendelton",
    instructorTitle: "Ex-IELTS Examiner & Author",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    totalSessions: 12,
    classCount: 1,
    studentCount: 14,
    status: "OPEN",
    startDate: "2026-08-01",
    endDate: "2026-09-10",
    priceRange: { min: 4000000, max: 4000000 },
    thumbnailUrl: "",
    createdAt: "2026-06-12T09:45:00Z"
  },
  {
    id: "c-vietnamese-expat",
    title: "Vietnamese Communication for Expats",
    language: "Vietnamese",
    levels: ["A1", "A2"],
    description: "A practical course tailored for foreign expats living in Vietnam. Focuses on tones, street conversations, ordering coffee, calling Grab, and understanding local customs.",
    whatYouWillLearn: [
      "Distinguish and accurately pronounce the 6 Vietnamese tones.",
      "Handle transactions at local markets, cafes, and restaurants.",
      "Ask for directions, tell time, and count currency numbers.",
      "Navigate cultural codes and etiquette in Vietnam."
    ],
    instructorName: "Nguyen Thi Lan",
    instructorTitle: "Vietnamese as a Second Language Coach",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    totalSessions: 20,
    classCount: 1,
    studentCount: 5,
    status: "OPEN",
    startDate: "2026-08-05",
    endDate: "2026-09-30",
    priceRange: { min: 1500000, max: 1500000 },
    thumbnailUrl: "",
    createdAt: "2026-06-15T11:20:00Z"
  }
]

const INITIAL_CLASSES = [
  {
    id: "cls-chinese-a",
    courseId: "c-chinese",
    courseName: "Intermediate Chinese Conversation",
    title: "HSK3 Speech Booster - Class A",
    language: "Chinese",
    levels: ["HSK3"],
    description: "Intermediate class focusing on speech patterns, tones, and cultural roleplay. Held thrice weekly.",
    progress: { completedSessions: 6, totalSessions: 24 },
    startDate: "2026-07-15",
    endDate: "2026-09-10",
    schedule: { days: ["MON", "WED", "FRI"], startTime: "18:00", endTime: "20:00" },
    slots: 20,
    studentCount: 12,
    tuitionFee: 2500000,
    status: "ONGOING",
    thumbnailUrl: "",
    instructorName: "Prof. Chen Wei",
    sessions: [
      { number: 7, date: "2026-07-06", startTime: "18:00", endTime: "20:00", status: "UPCOMING", topic: "Expressing feelings and opinions" },
      { number: 8, date: "2026-07-08", startTime: "18:00", endTime: "20:00", status: "UPCOMING", topic: "Discussing workspace schedules" }
    ]
  },
  {
    id: "cls-chinese-b",
    courseId: "c-chinese",
    courseName: "Intermediate Chinese Conversation",
    title: "HSK4 Advanced Conversations - Class B",
    language: "Chinese",
    levels: ["HSK4"],
    description: "Higher intermediate batch geared toward fluent business interactions and writing. Held twice weekly.",
    progress: { completedSessions: 0, totalSessions: 24 },
    startDate: "2026-07-18",
    endDate: "2026-09-12",
    schedule: { days: ["TUE", "THU"], startTime: "19:30", endTime: "21:30" },
    slots: 15,
    studentCount: 3,
    tuitionFee: 2800000,
    status: "OPEN",
    thumbnailUrl: "",
    instructorName: "Dr. Wang Liang",
    sessions: [
      { number: 1, date: "2026-07-18", startTime: "19:30", endTime: "21:30", status: "UPCOMING", topic: "Course overview & baseline assessment" }
    ]
  },
  {
    id: "cls-english-biz-a",
    courseId: "c-english-biz",
    courseName: "Business English Masterclass",
    title: "Executive Communication - Batch A",
    language: "English",
    levels: ["B2"],
    description: "A class for mid-level professionals seeking to improve email writing, meetings representation, and client reporting.",
    progress: { completedSessions: 2, totalSessions: 16 },
    startDate: "2026-07-20",
    endDate: "2026-09-15",
    schedule: { days: ["TUE", "THU"], startTime: "19:00", endTime: "21:00" },
    slots: 25,
    studentCount: 14,
    tuitionFee: 3200000,
    status: "ONGOING",
    thumbnailUrl: "",
    instructorName: "Sarah Jenkins",
    sessions: [
      { number: 3, date: "2026-07-07", startTime: "19:00", endTime: "21:00", status: "UPCOMING", topic: "Email diplomacy & negotiations" }
    ]
  },
  {
    id: "cls-english-biz-b",
    courseId: "c-english-biz",
    courseName: "Business English Masterclass",
    title: "C-Suite Presentation Prep - Batch B",
    language: "English",
    levels: ["C1"],
    description: "Advanced vocabulary, public speaking, and direct presentation training for corporate management.",
    progress: { completedSessions: 0, totalSessions: 16 },
    startDate: "2026-07-22",
    endDate: "2026-09-17",
    schedule: { days: ["SAT", "SUN"], startTime: "09:00", endTime: "11:00" },
    slots: 12,
    studentCount: 8,
    tuitionFee: 3500000,
    status: "OPEN",
    thumbnailUrl: "",
    instructorName: "Sarah Jenkins",
    sessions: [
      { number: 1, date: "2026-07-22", startTime: "09:00", endTime: "11:00", status: "UPCOMING", topic: "Pitching and structuring narratives" }
    ]
  },
  {
    id: "cls-japanese-a",
    courseId: "c-japanese-beg",
    courseName: "Japanese for Beginners (N5)",
    title: "Introductory Hiragana & Basic Grammar - Batch A",
    language: "Japanese",
    levels: ["N5"],
    description: "Foundational Japanese starting from basic kana character writing and traveling greetings.",
    progress: { completedSessions: 0, totalSessions: 30 },
    startDate: "2026-07-25",
    endDate: "2026-10-15",
    schedule: { days: ["MON", "THU"], startTime: "18:30", endTime: "20:30" },
    slots: 15,
    studentCount: 8,
    tuitionFee: 1800000,
    status: "OPEN",
    thumbnailUrl: "",
    instructorName: "Kenji Sato",
    sessions: [
      { number: 1, date: "2026-07-25", startTime: "18:30", endTime: "20:30", status: "UPCOMING", topic: "Hiragana Writing & Self-Introduction" }
    ]
  },
  {
    id: "cls-ielts-writing-a",
    courseId: "c-ielts-writing",
    courseName: "IELTS Academic Writing Lab",
    title: "Writing Band 7+ Workshop - Batch A",
    language: "English",
    levels: ["B2"],
    description: "Targeted training focusing on writing layouts, data summaries, and advanced argument generation.",
    progress: { completedSessions: 0, totalSessions: 12 },
    startDate: "2026-08-01",
    endDate: "2026-09-10",
    schedule: { days: ["WED", "FRI"], startTime: "19:00", endTime: "21:00" },
    slots: 18,
    studentCount: 14,
    tuitionFee: 4000000,
    status: "OPEN",
    thumbnailUrl: "",
    instructorName: "Arthur Pendelton",
    sessions: [
      { number: 1, date: "2026-08-01", startTime: "19:00", endTime: "21:00", status: "UPCOMING", topic: "IELTS writing templates overview" }
    ]
  },
  {
    id: "cls-vietnamese-a",
    courseId: "c-vietnamese-expat",
    courseName: "Vietnamese Communication for Expats",
    title: "Survival Vietnamese - Batch A",
    language: "Vietnamese",
    levels: ["A1"],
    description: "Practical conversational practice. Meet other expats and master pronunciation and shopping conversations.",
    progress: { completedSessions: 0, totalSessions: 20 },
    startDate: "2026-08-05",
    endDate: "2026-09-30",
    schedule: { days: ["MON", "WED"], startTime: "17:30", endTime: "19:30" },
    slots: 10,
    studentCount: 5,
    tuitionFee: 1500000,
    status: "OPEN",
    thumbnailUrl: "",
    instructorName: "Nguyen Thi Lan",
    sessions: [
      { number: 1, date: "2026-08-05", startTime: "17:30", endTime: "19:30", status: "UPCOMING", topic: "The 6 tones & greeting guidelines" }
    ]
  }
]

// Pre-enroll the student in one class for demonstration
const INITIAL_ENROLLMENTS = [
  {
    id: "e-1",
    courseId: "c-chinese",
    classId: "cls-chinese-a",
    enrolledAt: "2026-06-25T10:00:00Z",
    status: "active"
  }
]

// Fetch data helpers
function getFromStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key)
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback))
      return fallback
    }
    return JSON.parse(item)
  } catch (e) {
    console.error("Error reading from storage", key, e)
    return fallback
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error("Error saving to storage", key, e)
  }
}

// Service implementation
export const mockStudentService = {
  initialize() {
    getFromStorage(STORAGE_KEYS.COURSES, INITIAL_COURSES)
    getFromStorage(STORAGE_KEYS.CLASSES, INITIAL_CLASSES)
    getFromStorage(STORAGE_KEYS.ENROLLMENTS, INITIAL_ENROLLMENTS)
  },

  reset() {
    saveToStorage(STORAGE_KEYS.COURSES, INITIAL_COURSES)
    saveToStorage(STORAGE_KEYS.CLASSES, INITIAL_CLASSES)
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, INITIAL_ENROLLMENTS)
  },

  getEnrolledCourses() {
    this.initialize()
    const enrollments = getFromStorage(STORAGE_KEYS.ENROLLMENTS, [])
    const courses = getFromStorage(STORAGE_KEYS.COURSES, [])
    const classes = getFromStorage(STORAGE_KEYS.CLASSES, [])

    const enrolledCourseIds = enrollments.map(e => e.courseId)

    // Map enrolled courses and enrich details
    return courses
      .filter(course => enrolledCourseIds.includes(course.id))
      .map(course => {
        const studentEnrollment = enrollments.find(e => e.courseId === course.id)
        const enrolledClass = classes.find(cls => cls.id === studentEnrollment.classId)

        return {
          ...course,
          enrolledClassId: enrolledClass?.id,
          enrolledClassName: enrolledClass?.title,
          progress: enrolledClass?.progress || { completedSessions: 0, totalSessions: 24 }
        }
      })
  },

  getAvailableCourses() {
    this.initialize()
    const enrollments = getFromStorage(STORAGE_KEYS.ENROLLMENTS, [])
    const courses = getFromStorage(STORAGE_KEYS.COURSES, [])

    const enrolledCourseIds = enrollments.map(e => e.courseId)

    // Return courses the student hasn't joined yet
    return courses.filter(course => !enrolledCourseIds.includes(course.id))
  },

  getJoinedClasses() {
    this.initialize()
    const enrollments = getFromStorage(STORAGE_KEYS.ENROLLMENTS, [])
    const classes = getFromStorage(STORAGE_KEYS.CLASSES, [])

    const enrolledClassIds = enrollments.map(e => e.classId)

    return classes.filter(cls => enrolledClassIds.includes(cls.id))
  },

  getClassDetail(classId) {
    this.initialize()
    const classes = getFromStorage(STORAGE_KEYS.CLASSES, [])
    return classes.find(cls => cls.id === classId) || null
  },

  getCourseDetail(courseId) {
    this.initialize()
    const courses = getFromStorage(STORAGE_KEYS.COURSES, [])
    const classes = getFromStorage(STORAGE_KEYS.CLASSES, [])

    const course = courses.find(c => c.id === courseId)
    if (!course) return null

    const courseClasses = classes.filter(cls => cls.courseId === courseId)
    return {
      ...course,
      classes: courseClasses
    }
  },

  enrollInCourse(courseId, classId) {
    this.initialize()
    const enrollments = getFromStorage(STORAGE_KEYS.ENROLLMENTS, [])
    const courses = getFromStorage(STORAGE_KEYS.COURSES, [])
    const classes = getFromStorage(STORAGE_KEYS.CLASSES, [])

    // Check if already enrolled
    const exists = enrollments.some(e => e.courseId === courseId)
    if (exists) {
      throw new Error("Already enrolled in this course")
    }

    // Add enrollment record
    const newEnrollment = {
      id: `e-${Date.now()}`,
      courseId,
      classId,
      enrolledAt: new Date().toISOString(),
      status: "active"
    }
    enrollments.push(newEnrollment)
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, enrollments)

    // Increment studentCount in class
    const updatedClasses = classes.map(cls => {
      if (cls.id === classId) {
        return {
          ...cls,
          studentCount: (cls.studentCount || 0) + 1
        }
      }
      return cls
    })
    saveToStorage(STORAGE_KEYS.CLASSES, updatedClasses)

    // Increment studentCount in course
    const updatedCourses = courses.map(course => {
      if (course.id === courseId) {
        return {
          ...course,
          studentCount: (course.studentCount || 0) + 1
        }
      }
      return course
    })
    saveToStorage(STORAGE_KEYS.COURSES, updatedCourses)

    return { success: true, enrollment: newEnrollment }
  }
}
