import React from "react";
import Modal from "@/shared/components/ui/Modal";
import { Info } from "lucide-react";

const ImportExcelInstructionModal = ({ open, onClose, ce }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-gray-800">
          <Info className="w-5 h-5 text-[#990011]" strokeWidth={2.5} />
          <span className="text-[20px] font-bold">
            {ce.importExcelHowToTitle || "Hướng dẫn tạo câu hỏi bằng file Excel"}
          </span>
        </div>
      }
      className="md:max-w-xl w-full"
      bodyClassName="px-4 sm:px-6 flex-1 overflow-y-auto"
      footer={
        <div className="flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#F3F3F3] hover:bg-[#E2E2E2] text-[#1A1C1C] font-semibold rounded-xl transition-colors"
          >
            {ce.close || "Đóng"}
          </button>
        </div>
      }
    >
      <div className="pt-2 pb-6">
        <ol className="text-sm leading-6 text-gray-700 space-y-3 list-decimal list-inside   p-5 rounded-2xl">
          <li>
            {ce.importExcelTip1 ||
              "Mỗi dòng là một câu hỏi. Để trống dòng nào thì dòng đó bị bỏ qua."}
          </li>
          <li>
            {ce.importExcelTip2 ||
              "Cột Question Text: nội dung câu hỏi (bắt buộc, không được để trống)."}
          </li>
          <li>
            {ce.importExcelTip3 ||
              "Cột Question Type: chọn đúng 1 trong 5 loại: MultipleChoiceSingle (trắc nghiệm 1 đáp án), MultipleChoiceMultiple (nhiều đáp án), TrueFalse (đúng/sai), FillInBlank (điền khuyết), Essay (tự luận)."}
          </li>
          <li>
            {ce.importExcelTip4 ||
              'Cột Option 1-5: mỗi ô là 1 lựa chọn. Trắc nghiệm cần ít nhất 2 lựa chọn; Đúng/Sai điền "Đúng" và "Sai" vào 2 ô đầu; câu Điền khuyết / Tự luận để trống.'}
          </li>
          <li>
            {ce.importExcelTip5 ||
              "Cột Correct Answer: Trắc nghiệm & Đúng/Sai nhập SỐ THỨ TỰ của đáp án đúng (1 = Option 1, 3 = Option 3, nhiều đáp án ngăn cách bằng dấu phẩy, ví dụ: 1, 3, 5). Câu Điền khuyết nhập đáp án chính xác (ví dụ: 100). Câu Tự luận để trống."}
          </li>
          <li>
            {ce.importExcelTip6 ||
              "Cột Image Link (tùy chọn): dán link ảnh công khai, hệ thống tự tải về. Link nội bộ/không truy cập được sẽ bị bỏ qua nhưng vẫn import câu hỏi bình thường."}
          </li>
          <li>
            {ce.importExcelTip7 ||
              "Điểm câu hỏi mặc định 5, tất cả câu hỏi đều được đặt bắt buộc trả lời."}
          </li>
        </ol>
      </div>
    </Modal>
  );
};

export default ImportExcelInstructionModal;
