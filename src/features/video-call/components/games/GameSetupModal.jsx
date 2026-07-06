import React, { useState } from "react";
import Modal from "@/shared/components/ui/Modal";
import Dropdown from "@/shared/components/ui/Dropdown";
import { useLanguage } from "@/shared/context/LanguageContext";

const GameSetupModal = ({ open, onClose }) => {
  const { t } = useLanguage();
  const [selectedLevel, setSelectedLevel] = useState("easy");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const handleStart = () => {
    const event = new CustomEvent("mockStartGame", {
      detail: { level: selectedLevel, language: selectedLanguage },
    });
    window.dispatchEvent(event);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.rooms?.game?.setup?.title || "Thiết lập Trò chơi"}
      className="bg-white text-slate-900 max-w-sm rounded-3xl overflow-hidden border border-gray-200 shadow-2xl"
      headerClassName="flex items-center justify-between p-4 pl-6 border-b border-gray-100"
      fullScreenOnMobile={false}
    >
      <div className="py-6 px-6 text-slate-600 flex flex-col gap-6">

        {/* Chọn Ngôn ngữ */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-slate-700">
            {t.rooms?.game?.setup?.selectLanguage || "Ngôn ngữ"}
          </label>
          <Dropdown
            options={[
              { label: t.rooms?.game?.setup?.langEn || "Tiếng Anh (English)", value: "en" },
              { label: t.rooms?.game?.setup?.langZh || "Tiếng Trung (中文)", value: "zh" },
            ]}
            value={selectedLanguage}
            onChange={(val) => setSelectedLanguage(val)}
            dropdownClassName="w-full max-w-full"
            triggerClassName="w-full justify-between bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-4 py-3 outline-none hover:border-cath-red-400 transition-all"
          />
        </div>

        {/* Chọn Cấp độ */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-slate-700">
            {t.rooms?.game?.setup?.selectLevel || "Mức độ"}
          </label>
          <Dropdown
            options={[
              { label: t.rooms?.game?.setup?.levelEasy || "Dễ (Beginner)", value: "easy" },
              { label: t.rooms?.game?.setup?.levelMedium || "Trung bình (Intermediate)", value: "medium" },
              { label: t.rooms?.game?.setup?.levelHard || "Khó (Advanced)", value: "hard" },
            ]}
            value={selectedLevel}
            onChange={(val) => setSelectedLevel(val)}
            dropdownClassName="w-full max-w-full"
            triggerClassName="w-full justify-between bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-4 py-3 outline-none hover:border-cath-red-400 transition-all"
          />
        </div>
      </div>
      
      <div className="flex gap-3 p-4 border-t border-gray-100 bg-gray-50">
        <button
          onClick={onClose}
          className="flex-1 py-3 px-4 rounded-xl font-bold bg-gray-200 hover:bg-gray-300 text-slate-700 transition-all"
        >
          {t.rooms?.game?.setup?.cancel || "Hủy"}
        </button>
        <button
          onClick={handleStart}
          className="flex-1 py-3 px-4 rounded-xl font-bold bg-cath-red-500 hover:bg-cath-red-600 text-white shadow-lg shadow-cath-red-500/25 transition-all"
        >
          {t.rooms?.game?.setup?.start || "Bắt đầu ngay"}
        </button>
      </div>
    </Modal>
  );
};

export default GameSetupModal;
