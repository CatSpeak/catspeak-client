import { Check, Sparkles } from "lucide-react"

const comparisonRows = [
  {
    criterion: "Hình thức luyện tập",
    options: [
      "Học thụ động (chọn đáp án, điền từ)",
      "Tự nói trước gương, lặp lại video",
      "Lớp học truyền thống 15–20 người",
    ],
    catspeak: "Đối thoại trực tiếp 1-1, nhóm & AI linh hoạt",
  },
  {
    criterion: "Phản xạ nói 2 chiều thời gian thực",
    options: [
      "Không có (chỉ nghe/đọc)",
      "Một chiều, không có tính bất ngờ",
      "Có nhưng thời lượng mỗi người rất ít",
    ],
    catspeak: "100% thời gian dành cho nói và phản hồi",
  },
  {
    criterion: "Hỗ trợ 3 ngôn ngữ (Anh - Trung - Nhật)",
    options: [
      "Thường tách biệt từng app riêng lẻ",
      "Khó tiếp cận nguồn luyện đa ngữ",
      "Chỉ đào tạo đơn ngôn ngữ một khóa",
    ],
    catspeak: "Tích hợp cả 3 ngôn ngữ trên 1 nền tảng",
  },
  {
    criterion: "Tìm bạn cùng luyện phù hợp",
    options: [
      "Không có bạn học",
      "Hoàn toàn đơn độc",
      "Cố định theo lớp, khó kết nối ngoài giờ",
    ],
    catspeak: "Ghép đôi tự động theo mục tiêu & trình độ",
  },
  {
    criterion: "Sửa lỗi và gợi ý từ vựng",
    options: [
      "Đáp án có sẵn, thiếu tính ngữ cảnh",
      "Không có ai phát hiện lỗi sai",
      "Giáo viên sửa nhưng không đủ bao quát",
    ],
    catspeak: "AI gợi ý nâng cấp câu & bạn học góp ý",
  },
  {
    criterion: "Thời gian & tính chủ động",
    options: [
      "Tùy ý trên điện thoại",
      "Tùy ý tại nhà",
      "Cố định theo ca học trong tuần",
    ],
    catspeak: "Tự do bật phòng bất kỳ lúc nào rảnh",
  },
  {
    criterion: "Tâm lý sợ sai & ngại phán xét",
    options: [
      "Không có áp lực (nhưng không nói)",
      "Không áp lực (nhưng dễ nhàm chán)",
      "Áp lực khi nói trước cả lớp đông",
    ],
    catspeak: "Phòng riêng tư, văn minh; AI kiên nhẫn",
  },
]

const MethodComparisonSection = () => (
  <section
    id="solutions"
    className="w-full bg-[#f3f3f3] px-4 py-12 transition-colors dark:bg-[#171717] sm:px-6 sm:py-16 lg:px-8"
  >
    <div className="mx-auto max-w-[1280px]">
      <header className="mx-auto mb-8 max-w-[800px] text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#B3261E] dark:text-[#ff7a8a] sm:text-sm">
          So sánh khách quan phương pháp
        </p>
        <h2 className="mt-3 text-[clamp(2rem,4vw,2.65rem)] font-black leading-[1.08] tracking-[-0.04em] text-[#171717] dark:text-white">
          Khác biệt khi luyện nói cùng CAT SPEAK
        </h2>
        <p className="mx-auto mt-2 max-w-[760px] text-sm leading-6 text-[#666] dark:text-gray-300 sm:text-base">
          Xem xét các tiêu chí thực hành giao tiếp để lựa chọn phương pháp học
          tập phù hợp nhất với quỹ thời gian và mục tiêu của bạn.
        </p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-[#dedede] bg-white shadow-sm dark:border-[#3b3b3b] dark:bg-[#202020]">
        <table className="w-full min-w-[980px] table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-[23%]" />
            <col className="w-[19%]" />
            <col className="w-[19%]" />
            <col className="w-[19%]" />
            <col className="w-[20%]" />
          </colgroup>
          <thead>
            <tr className="bg-[#fafafa] dark:bg-[#252525]">
              <th
                scope="col"
                className="px-5 py-4 text-xs font-bold uppercase text-[#555] dark:text-gray-300"
              >
                Tiêu chí so sánh
              </th>
              <th
                scope="col"
                className="px-4 py-4 text-center text-xs font-bold uppercase text-[#555] dark:text-gray-300"
              >
                App tự học thụ động
              </th>
              <th
                scope="col"
                className="px-4 py-4 text-center text-xs font-bold uppercase text-[#555] dark:text-gray-300"
              >
                Tự nói một mình
              </th>
              <th
                scope="col"
                className="px-4 py-4 text-center text-xs font-bold uppercase text-[#555] dark:text-gray-300"
              >
                Lớp học trung tâm
              </th>
              <th
                scope="col"
                className="border-x border-[#f1dada] bg-[#fff7f7] px-4 py-3 text-center dark:border-[#543337] dark:bg-[#302124]"
              >
                <span className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase leading-4 text-[#A90016] dark:text-[#ff9da7]">
                  <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>CAT SPEAK<br />Community</span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map(({ criterion, options, catspeak }) => (
              <tr
                key={criterion}
                className="border-t border-[#ececec] dark:border-[#383838]"
              >
                <th
                  scope="row"
                  className="px-5 py-4 text-xs font-bold leading-5 text-[#222] dark:text-gray-100"
                >
                  {criterion}
                </th>
                {options.map((option, index) => (
                  <td
                    key={index}
                    className="px-4 py-4 text-xs leading-[1.55] text-[#777] dark:text-gray-400"
                  >
                    {option}
                  </td>
                ))}
                <td className="border-x border-[#f1dada] bg-[#fffafa] px-4 py-3 dark:border-[#543337] dark:bg-[#2a2021]">
                  <div className="flex items-start gap-2 text-xs font-semibold leading-[1.45] text-[#A90016] dark:text-[#ff9da7]">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                    <span>{catspeak}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-center text-xs leading-5 text-[#777] dark:text-gray-400">
        * Đánh giá dựa trên tiêu chí tạo phản xạ nói trực tiếp hai chiều. Mỗi
        phương pháp đều có giá trị bổ trợ lẫn nhau trong hành trình tiếp thu
        ngôn ngữ.
      </p>
    </div>
  </section>
)

export default MethodComparisonSection
