/**
 * CatSpeak Analytics Data & Helper Utilities
 */

export const courses = [
  { id: 'advanced', name: 'Advanced Conversation', classes: ['AC-T2-4-6 Buổi tối', 'AC-T3-5-7 Buổi tối', 'AC-Cuối tuần'] },
  { id: 'business', name: 'Business English', classes: ['BE-T3-5-7', 'BE-T7-CN', 'BE-Buổi sáng'] },
  { id: 'ielts', name: 'IELTS Speaking Mastery', classes: ['IELTS-T2-4-6', 'IELTS-T3-5-7', 'IELTS-Cuối tuần'] },
  { id: 'kids', name: 'Young Learners Starters', classes: ['Kids-T7-CN', 'Kids-T3-5'] },
  { id: 'daily', name: 'Daily English Communication', classes: ['DEC-T2-4-6', 'DEC-T3-5-7'] },
  { id: 'grammar', name: 'Grammar Essentials', classes: ['Grammar-T3-5-7', 'Grammar-Cuối tuần'] },
  { id: 'pronunciation', name: 'Pronunciation Mastery', classes: ['Pronunciation-T2-4', 'Pronunciation-T7-CN'] },
  { id: 'travel', name: 'Travel English', classes: ['Travel-T7-CN', 'Travel-T3-5'] },
  { id: 'interview', name: 'Interview English', classes: ['Interview-T2-4', 'Interview-Cuối tuần'] },
]

export const standaloneClasses = [
  'Giao tiếp 1-1 - Anh Minh',
  'Phát âm nâng cao',
  'Interview Preparation',
  'Business Coaching 1-1',
]

export const groupMeta = {
  day: {
    label: 'Theo ngày',
    periods: ['Tháng 05/2025', 'Tháng 04/2025', 'Tháng 03/2025'],
    comparisons: ['Tháng 04/2025', 'Cùng kỳ năm trước'],
  },
  week: {
    label: 'Theo tuần',
    periods: ['Quý 2/2025', 'Quý 1/2025', 'Quý 4/2024'],
    comparisons: ['Quý 1/2025', 'Cùng kỳ năm trước'],
  },
  month: {
    label: 'Theo tháng',
    periods: ['Năm 2025', 'Năm 2024', 'Năm 2023'],
    comparisons: ['Năm 2024', 'Năm 2023'],
  },
  year: {
    label: 'Theo năm',
    periods: ['2021 - 2025', '2016 - 2020'],
    comparisons: ['2016 - 2020', 'Không so sánh'],
  },
}

export const labels = {
  month: ['T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'T09', 'T10', 'T11', 'T12'],
  day: ['01/05', '04/05', '07/05', '10/05', '13/05', '16/05', '19/05', '22/05', '25/05', '28/05', '31/05'],
  week: ['Tuần 14', 'Tuần 15', 'Tuần 16', 'Tuần 17', 'Tuần 18', 'Tuần 19', 'Tuần 20', 'Tuần 21', 'Tuần 22'],
  year: ['2021', '2022', '2023', '2024', '2025'],
}

export const trendData = {
  month: {
    students: [178, 184, 193, 207, 219, 232, 241, 252, 265, 278, 291, 306],
    newStudents: [24, 28, 31, 37, 42, 48, 51, 57, 63, 69, 76, 86],
    revenue: [36, 41, 48, 55, 64, 59, 67, 72, 69, 76, 81, 85.6],
    ratings: [4.45, 4.50, 4.52, 4.60, 4.65, 4.68, 4.70, 4.75, 4.78, 4.80, 4.82, 4.85],
  },
  day: {
    students: [186, 190, 196, 203, 211, 220, 228, 235, 244, 251, 256],
    newStudents: [48, 50, 54, 59, 62, 66, 70, 75, 80, 84, 86],
    revenue: [35, 38, 41, 46, 51, 55, 59, 64, 70, 78, 85.6],
    ratings: [4.55, 4.58, 4.60, 4.62, 4.65, 4.70, 4.72, 4.75, 4.78, 4.80, 4.82],
  },
  week: {
    students: [186, 198, 211, 224, 239, 248, 256, 267, 278],
    newStudents: [48, 52, 57, 61, 67, 72, 76, 81, 86],
    revenue: [42, 48, 53, 59, 64, 68, 73, 79, 85.6],
    ratings: [4.50, 4.55, 4.60, 4.65, 4.68, 4.72, 4.75, 4.79, 4.82],
  },
  year: {
    students: [116, 154, 198, 244, 306],
    newStudents: [28, 38, 52, 69, 86],
    revenue: [32, 48, 62, 73, 85.6],
    ratings: [4.20, 4.40, 4.55, 4.70, 4.82],
  },
}

export const classRows = [
  { className: 'AC-T2-4-6 Buổi tối', course: 'Advanced Conversation', learners: 24, gross: 24000000, fee: 1200000, net: 22800000, fill: 92, conversion: 48, rating: 4.9, cancellation: 4, repeat: 68, completion: 89, newRegistrations: 7 },
  { className: 'IELTS-T3-5-7', course: 'IELTS Speaking Mastery', learners: 18, gross: 18800000, fee: 940000, net: 17860000, fill: 86, conversion: 44, rating: 4.8, cancellation: 5, repeat: 62, completion: 84, newRegistrations: 5 },
  { className: 'Giao tiếp 1-1 - Anh Minh', course: 'Không thuộc khóa', learners: 5, gross: 12500000, fee: 625000, net: 11875000, fill: 100, conversion: 52, rating: 4.9, cancellation: 2, repeat: 74, completion: 96, newRegistrations: 2 },
  { className: 'BE-T7-CN', course: 'Business English', learners: 14, gross: 9800000, fee: 490000, net: 9310000, fill: 78, conversion: 38, rating: 4.7, cancellation: 7, repeat: 57, completion: 79, newRegistrations: 4 },
  { className: 'Kids-T7-CN', course: 'Young Learners Starters', learners: 16, gross: 7200000, fee: 360000, net: 6840000, fill: 80, conversion: 40, rating: 4.7, cancellation: 4, repeat: 65, completion: 82, newRegistrations: 4 },
  { className: 'Phát âm nâng cao', course: 'Không thuộc khóa', learners: 12, gross: 6500000, fee: 325000, net: 6175000, fill: 75, conversion: 37, rating: 4.6, cancellation: 6, repeat: 55, completion: 80, newRegistrations: 3 },
  { className: 'AC-T3-5-7 Buổi tối', course: 'Advanced Conversation', learners: 20, gross: 19200000, fee: 960000, net: 18240000, fill: 83, conversion: 45, rating: 4.8, cancellation: 4, repeat: 65, completion: 87, newRegistrations: 6 },
  { className: 'BE-T3-5-7', course: 'Business English', learners: 17, gross: 11800000, fee: 590000, net: 11210000, fill: 85, conversion: 42, rating: 4.7, cancellation: 5, repeat: 60, completion: 84, newRegistrations: 5 },
  { className: 'IELTS-T2-4-6', course: 'IELTS Speaking Mastery', learners: 21, gross: 16700000, fee: 835000, net: 15865000, fill: 88, conversion: 46, rating: 4.8, cancellation: 4, repeat: 63, completion: 86, newRegistrations: 6 },
  { className: 'Kids-T3-5', course: 'Young Learners Starters', learners: 13, gross: 6800000, fee: 340000, net: 6460000, fill: 72, conversion: 36, rating: 4.6, cancellation: 6, repeat: 54, completion: 78, newRegistrations: 3 },
  { className: 'DEC-T2-4-6', course: 'Daily English Communication', learners: 18, gross: 8400000, fee: 420000, net: 7980000, fill: 82, conversion: 41, rating: 4.7, cancellation: 5, repeat: 59, completion: 83, newRegistrations: 5 },
  { className: 'Grammar-T3-5-7', course: 'Grammar Essentials', learners: 15, gross: 7900000, fee: 395000, net: 7505000, fill: 79, conversion: 39, rating: 4.6, cancellation: 6, repeat: 56, completion: 81, newRegistrations: 4 },
  { className: 'Pronunciation-T2-4', course: 'Pronunciation Mastery', learners: 14, gross: 7200000, fee: 360000, net: 6840000, fill: 78, conversion: 39, rating: 4.7, cancellation: 5, repeat: 58, completion: 82, newRegistrations: 4 },
  { className: 'Travel-T7-CN', course: 'Travel English', learners: 11, gross: 5900000, fee: 295000, net: 5605000, fill: 69, conversion: 34, rating: 4.5, cancellation: 7, repeat: 51, completion: 76, newRegistrations: 3 },
  { className: 'Interview Preparation', course: 'Không thuộc khóa', learners: 8, gross: 4800000, fee: 240000, net: 4560000, fill: 67, conversion: 33, rating: 4.6, cancellation: 5, repeat: 52, completion: 79, newRegistrations: 2 },
  { className: 'Business Coaching 1-1', course: 'Không thuộc khóa', learners: 4, gross: 9800000, fee: 490000, net: 9310000, fill: 100, conversion: 50, rating: 4.9, cancellation: 1, repeat: 76, completion: 98, newRegistrations: 1 },
]

export const courseRows = [
  { course: 'Advanced Conversation', classCount: 6, students: 96, gross: 52300000, average: 8716667, fill: 83, completion: 86, rating: 4.8, repeat: 64, cancellation: 4.1 },
  { course: 'IELTS Speaking Mastery', classCount: 5, students: 88, gross: 45800000, average: 9160000, fill: 82, completion: 85, rating: 4.8, repeat: 62, cancellation: 4.6 },
  { course: 'Business English', classCount: 5, students: 78, gross: 38200000, average: 7640000, fill: 79, completion: 82, rating: 4.7, repeat: 59, cancellation: 5.2 },
  { course: 'Young Learners Starters', classCount: 4, students: 64, gross: 26400000, average: 6600000, fill: 76, completion: 80, rating: 4.7, repeat: 57, cancellation: 4.3 },
  { course: 'Daily English Communication', classCount: 4, students: 71, gross: 28600000, average: 7150000, fill: 81, completion: 83, rating: 4.7, repeat: 60, cancellation: 4.8 },
  { course: 'Grammar Essentials', classCount: 3, students: 52, gross: 21300000, average: 7100000, fill: 77, completion: 81, rating: 4.6, repeat: 56, cancellation: 5.4 },
  { course: 'Pronunciation Mastery', classCount: 3, students: 49, gross: 19800000, average: 6600000, fill: 74, completion: 80, rating: 4.6, repeat: 55, cancellation: 5.8 },
  { course: 'Travel English', classCount: 3, students: 43, gross: 17200000, average: 5733333, fill: 69, completion: 76, rating: 4.5, repeat: 51, cancellation: 6.4 },
  { course: 'Interview English', classCount: 2, students: 31, gross: 14800000, average: 7400000, fill: 73, completion: 79, rating: 4.6, repeat: 53, cancellation: 5.7 },
]

export const studentCourseRows = [
  { course: 'Advanced Conversation', classCount: 6, total: 224, average: 37, newStudents: 48, returning: 176, retention: 78.6 },
  { course: 'IELTS Speaking Mastery', classCount: 5, total: 198, average: 40, newStudents: 42, returning: 156, retention: 76.4 },
  { course: 'Business English', classCount: 5, total: 164, average: 33, newStudents: 35, returning: 129, retention: 74.2 },
  { course: 'Young Learners Starters', classCount: 4, total: 132, average: 33, newStudents: 31, returning: 101, retention: 72.8 },
  { course: 'Daily English Communication', classCount: 4, total: 146, average: 37, newStudents: 34, returning: 112, retention: 76.7 },
  { course: 'Grammar Essentials', classCount: 3, total: 108, average: 36, newStudents: 25, returning: 83, retention: 73.1 },
  { course: 'Pronunciation Mastery', classCount: 3, total: 96, average: 32, newStudents: 23, returning: 73, retention: 71.5 },
  { course: 'Travel English', classCount: 3, total: 82, average: 27, newStudents: 19, returning: 63, retention: 69.2 },
  { course: 'Interview English', classCount: 2, total: 61, average: 31, newStudents: 16, returning: 45, retention: 70.4 },
]

export const numberVi = (value, maximumFractionDigits = 2) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits }).format(value)

export const money = (value) => `${new Intl.NumberFormat('vi-VN').format(value)} đ`

export const exportCsv = (filteredClasses) => {
  const head = ['Lớp học', 'Khóa học', 'Học viên', 'Doanh thu', 'Phí nền tảng', 'Thực nhận']
  const rows = filteredClasses.map((row) => [
    row.className,
    row.course,
    row.learners,
    row.gross,
    row.fee,
    row.net,
  ])
  const csv = [head, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'catspeak-analytics-report.csv'
  anchor.click()
  URL.revokeObjectURL(url)
}
