/**
 * Class Analytics Mock Data for STB (Speaking Time Balance)
 */

export const mockClassAnalyticsData = {
  id: "class-b2-sang",
  className: "Tiếng Anh B2 — Nhóm sáng",
  courseName: "Tiếng Anh B2",
  term: "Kỳ Hè 2026",
  totalStudents: 4,
  totalSessions: 24,
  teacherName: "Minh Hoàng",
  avgClassStb: 78,
  belowThresholdCount: 1,
  thresholdRate: 25,
  students: [
    {
      id: "std-1",
      name: "Nguyễn A",
      initial: "N",
      avatarBg: "bg-gray-100 text-gray-700 border border-gray-200",
      avgStbPercent: 35,
      barLevel: 3,
      barColor: "bg-[#16a34a]", // green
      barTrackWidth: "75%",
      sessionsMet: 16,
      sessionsUnmet: 8,
      trend: "improving", // "improving" | "stable" | "declining"
      status: "normal", // "normal" | "attention" | "warning"
    },
    {
      id: "std-2",
      name: "Trần B",
      initial: "T",
      avatarBg: "bg-gray-100 text-gray-700 border border-gray-200",
      avgStbPercent: 25,
      barLevel: 2,
      barColor: "bg-[#16a34a]", // green
      barTrackWidth: "55%",
      sessionsMet: 14,
      sessionsUnmet: 10,
      trend: "stable",
      status: "normal",
    },
    {
      id: "std-3",
      name: "Lê C",
      initial: "L",
      avatarBg: "bg-gray-100 text-gray-700 border border-gray-200",
      avgStbPercent: 18,
      barLevel: 2,
      barColor: "bg-[#d97706]", // orange / amber
      barTrackWidth: "45%",
      sessionsMet: 8,
      sessionsUnmet: 16,
      trend: "declining",
      status: "attention",
    },
    {
      id: "std-4",
      name: "Phạm Đ",
      initial: "P",
      avatarBg: "bg-gray-100 text-gray-700 border border-gray-200",
      avgStbPercent: 12,
      barLevel: 1,
      barColor: "bg-[#dc2626]", // red
      barTrackWidth: "30%",
      sessionsMet: 5,
      sessionsUnmet: 19,
      trend: "declining",
      status: "warning",
    },
  ],
  sessions: Array.from({ length: 24 }, (_, i) => {
    const sessionNum = i + 1
    const teacherPercent = 28
    const studentTotalPercent = 72
    return {
      sessionNumber: sessionNum,
      title: `Buổi ${sessionNum}`,
      topic: `Chủ đề bài giảng ${sessionNum}: Kỹ năng Speaking & Thảo luận nhóm thực tế`,
      date: `2026-06-${String((sessionNum * 2) % 28 + 1).padStart(2, "0")}`,
      teacherSpeechPercent: teacherPercent,
      studentSpeechPercent: studentTotalPercent,
      studentsDetail: [
        { name: "Nguyễn A", percent: Math.min(48, Math.max(20, 30 + (i % 5) * 3)), durationSeconds: 240 + i * 10, isMet: true },
        { name: "Trần B", percent: Math.min(35, Math.max(15, 24 + (i % 3) * 2)), durationSeconds: 180 + i * 8, isMet: true },
        { name: "Lê C", percent: Math.min(25, Math.max(8, 18 - (i % 4) * 2)), durationSeconds: 90 + i * 4, isMet: i < 8 },
        { name: "Phạm Đ", percent: Math.min(22, Math.max(5, 12 - (i % 3) * 2)), durationSeconds: 60 + i * 4, isMet: i < 5 },
      ],
      healthStatus: i % 4 === 0 ? "attention" : "good",
    }
  }),
}

/**
 * Fetch class analytics data by class ID or fallback to default mock dataset
 */
export const getClassAnalyticsData = (classId) => {
  if (!classId) return mockClassAnalyticsData

  let formattedName = "Tiếng Anh B2 — Nhóm sáng"
  if (classId !== "class-b2-sang" && classId !== "default") {
    try {
      const decoded = decodeURIComponent(classId)
      if (decoded && decoded !== "undefined" && decoded !== "null") {
        formattedName = decoded
      }
    } catch {
      formattedName = classId
    }
  }

  return {
    ...mockClassAnalyticsData,
    id: classId,
    className: formattedName,
  }
}

/**
 * Detailed 24-session chronological history for student Lê C matching student-detail.png mockup exactly
 */
const mockLeCSessions = [
  {
    sessionNumber: 24,
    formattedSession: "#24",
    date: "T2 19/08/2026",
    time: "10:00–11:03",
    percent: 14,
    words: 87,
    expectedPercent: 25,
    isMet: false,
    status: "Chưa đạt",
    barColor: "bg-[#e11d48]", // red
    textColor: "text-[#e11d48]",
  },
  {
    sessionNumber: 23,
    formattedSession: "#23",
    date: "T6 14/08/2026",
    time: "10:00–11:15",
    percent: 31,
    words: 224,
    expectedPercent: 25,
    isMet: true,
    status: "Đạt",
    barColor: "bg-[#16a34a]", // green
    textColor: "text-[#16a34a]",
  },
  {
    sessionNumber: 22,
    formattedSession: "#22",
    date: "T2 11/08/2026",
    time: "10:00–10:48",
    percent: 28,
    words: 176,
    expectedPercent: 25,
    isMet: true,
    status: "Đạt",
    barColor: "bg-[#16a34a]", // green
    textColor: "text-[#16a34a]",
  },
  {
    sessionNumber: 21,
    formattedSession: "#21",
    date: "T6 07/08/2026",
    time: "10:00–11:02",
    percent: 35,
    words: 248,
    expectedPercent: 25,
    isMet: true,
    status: "Đạt",
    barColor: "bg-[#16a34a]", // green
    textColor: "text-[#16a34a]",
  },
  {
    sessionNumber: 20,
    formattedSession: "#20",
    date: "T2 04/08/2026",
    time: "10:00–11:00",
    percent: 22,
    words: 143,
    expectedPercent: 25,
    isMet: false,
    status: "Chưa đạt",
    barColor: "bg-[#d97706]", // amber/orange
    textColor: "text-[#d97706]",
  },
  {
    sessionNumber: 19,
    formattedSession: "#19",
    date: "T6 31/07/2026",
    time: "10:00–11:10",
    percent: 18,
    durationSeconds: 110,
    expectedPercent: 25,
    isMet: false,
    status: "Chưa đạt",
    barColor: "bg-[#d97706]", // amber/orange
    textColor: "text-[#d97706]",
  },
  // Sessions 18 down to 1
  ...Array.from({ length: 18 }, (_, idx) => {
    const sNum = 18 - idx
    const dayName = sNum % 2 === 0 ? "T2" : "T6"
    const percent = Math.min(38, Math.max(10, Math.round(20 + (sNum % 4) * 4 - (idx % 3) * 2)))
    const isMet = percent >= 25
    return {
      sessionNumber: sNum,
      formattedSession: `#${sNum}`,
      date: `${dayName} ${String((sNum * 3) % 28 + 1).padStart(2, "0")}/07/2026`,
      time: `10:00–11:${String((sNum * 4) % 30 + 5).padStart(2, "0")}`,
      percent,
      durationSeconds: Math.round(percent * 8.5),
      expectedPercent: 25,
      isMet,
      status: isMet ? "Đạt" : "Chưa đạt",
      barColor: isMet ? "bg-[#16a34a]" : percent >= 20 ? "bg-[#d97706]" : "bg-[#e11d48]",
      textColor: isMet ? "text-[#16a34a]" : percent >= 20 ? "text-[#d97706]" : "text-[#e11d48]",
    }
  }),
]

/**
 * Fetch student speaking analytics detail by classId and studentId
 */
export const getStudentAnalyticsData = (classId, studentId) => {
  const classData = getClassAnalyticsData(classId)

  // Find matching student
  let matched = classData.students.find(
    (st) => String(st.id) === String(studentId) || st.name.toLowerCase() === decodeURIComponent(studentId || "").toLowerCase()
  )

  // Default to Lê C if not found or std-3
  if (!matched) {
    matched = classData.students.find((st) => st.id === "std-3") || classData.students[2] || {
      id: "std-3",
      name: "Lê C",
      initial: "L",
      avgStbPercent: 24,
      trend: "declining",
      status: "attention",
    }
  }

  return {
    studentId: matched.id,
    studentName: matched.name,
    classId: classData.id,
    className: classData.className,
    term: classData.term,
    totalSessions: classData.totalSessions,
    classExpectedRate: classData.thresholdRate || 25,
    // 4 Top Cards Metrics (matching student-detail.png)
    avgSpeechPercent: matched.name === "Lê C" ? 24 : matched.avgStbPercent,
    metRecentCount: 3,
    recentTotal: 6,
    totalDurationSeconds: 1540,
    avgDurationPerSession: 256,
    trend: matched.trend || "declining",
    trendText: "Giảm dần",
    recentSessionNumber: 24,
    recentSessionPercent: 14,
    warningMessage: "Học viên này có 3/6 buổi gần đây chưa đạt ngưỡng và đang có xu hướng giảm — cân nhắc hỗ trợ thêm.",
    sessions: mockLeCSessions,
  }
}
