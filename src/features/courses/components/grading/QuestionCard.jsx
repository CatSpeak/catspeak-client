import React from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Image as ImageIcon,
  Menu,
  Music as MusicIcon,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Switch } from "@/shared/components/ui/inputs";

/**
 * A single editable question inside the exam builder.
 *
 * Memoized on purpose: the parent holds every question in one reducer array, so
 * editing question N produces a new array but leaves the other question objects
 * referentially identical. With a stable `handlers` bag and primitive index
 * props, only the edited card re-renders.
 *
 * @param {object}  props
 * @param {object}  props.question   One entry of the reducer's `questions` array.
 * @param {number}  props.index      Position in that array; handlers are index-based.
 * @param {number}  props.total      Question count, for the move-down bound.
 * @param {boolean} props.collapsed  Whether the body is collapsed to a summary.
 * @param {boolean} props.isDragged  This card is the one being dragged.
 * @param {boolean} props.isDraggable Drag is armed (mouse is on the grip).
 * @param {object}  props.ce         `t.courses.createExam` translation slice.
 * @param {object}  props.handlers   Stable handler bag from `useQuestionHandlers`.
 */
const QuestionCard = ({
  question,
  index,
  total,
  collapsed,
  isDragged,
  isDraggable,
  ce,
  handlers,
}) => {
  const {
    handleAddOption,
    handleAudioUpload,
    handleCopyQuestion,
    handleDeleteQuestion,
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    handleFillInBlankAnswerChange,
    handleMaxWordCountChange,
    handleMediaUpload,
    handleMoveQuestion,
    handleMultipleCorrectAnswerToggle,
    handleOptionTextChange,
    handleQuestionContentChange,
    handleQuestionTypeChange,
    handleRemoveAudio,
    handleRemoveMedia,
    handleRemoveOption,
    handleRequiredToggle,
    handleScoreChange,
    handleSingleCorrectAnswer,
    handleSkillTagChange,
    handleTipTextChange,
    setDraggableIndex,
    toggleCollapse,
  } = handlers;

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => handleDragStart(e, index)}
      onDragOver={(e) => handleDragOver(e, index)}
      onDragEnd={handleDragEnd}
      className={`relative bg-white border rounded-3xl overflow-hidden flex shadow-xs group transition-all duration-200 ${isDragged
        ? "opacity-40 border-dashed border-[#990011] scale-[0.99] bg-red-50/5"
        : "border-border border-solid"
        }`}
    >
      {/* Left drag-bar */}
      <div className="w-9 sm:w-12 bg-gray-200 border-r border-border flex flex-col items-center py-4 gap-1.5 select-none shrink-0">
        <button
          type="button"
          onClick={() => handleMoveQuestion(index, "up")}
          disabled={index === 0}
          aria-label={ce.moveQuestionUp || "Move question up"}
          className={`p-1 rounded hover:bg-gray-200 transition-colors ${index === 0 ? "text-gray-500 cursor-not-allowed" : "text-gray-500"}`}
        >
          <ChevronUp size={16} />
        </button>
        <div
          onMouseDown={() => setDraggableIndex(index)}
          onMouseUp={() => setDraggableIndex(null)}
          onMouseLeave={() => setDraggableIndex(null)}
          className="text-gray-500 cursor-grab active:cursor-grabbing p-1"
          title={ce.dragToReorder || "Drag to reorder"}
        >
          <Menu size={16} />
        </div>
        <button
          type="button"
          onClick={() => handleMoveQuestion(index, "down")}
          disabled={index === total - 1}
          aria-label={ce.moveQuestionDown || "Move question down"}
          className={`p-1 rounded hover:bg-gray-200 transition-colors ${index === total - 1 ? "text-gray-500 cursor-not-allowed" : "text-gray-500"}`}
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Main Card Content */}
      <div className="flex-1 min-w-0 p-4 sm:p-5 md:p-6 flex flex-col gap-4">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Collapse/Expand Toggle Button */}
            <button
              type="button"
              onClick={() => toggleCollapse(question.id)}
              className="p-1 hover:bg-gray-150 rounded-lg text-gray-500 hover:text-gray-700 transition-colors cursor-pointer shrink-0"
              title={
                collapsed
                  ? ce.expandQuestion || "Expand question"
                  : ce.collapseQuestion || "Collapse question"
              }
            >
              {collapsed ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronUp size={18} />
              )}
            </button>

            <span className="text-sm font-extrabold text-gray-800 select-none shrink-0 whitespace-nowrap">
              {ce.question || "Câu"} {index + 1}
            </span>
            {/* Dropdown Type */}
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <select
                value={question.type}
                onChange={(e) =>
                  handleQuestionTypeChange(index, e.target.value)
                }
                className="w-full sm:w-auto truncate pl-3 pr-8 py-1.5 bg-gray-50 border border-border rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-100 focus:border-[#990011] appearance-none cursor-pointer"
              >
                <option value="MultipleChoiceSingle">
                  {ce.mcqSingleOption || "Trắc nghiệm (1 đáp án)"}
                </option>
                <option value="MultipleChoiceMultiple">
                  {ce.mcqMultipleOption ||
                    "Trắc nghiệm (Nhiều đáp án)"}
                </option>
                <option value="TrueFalse">
                  {ce.trueFalseOption || "Đúng / Sai"}
                </option>
                <option value="FillInBlank">
                  {ce.fillInBlankOption || "Điền vào chỗ trống"}
                </option>
                <option value="Essay">
                  {ce.essayOption || "Tự luận"}
                </option>
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Controls & Points & File Upload Icons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Media Image Upload Icon Button */}
            <label
              className="p-1.5 border border-border bg-white hover:bg-gray-100 text-gray-600 hover:text-[#990011] rounded-xl cursor-pointer flex items-center gap-1 text-xs font-bold transition-all shadow-xs"
              title={ce.uploadImage || "Upload image"}
            >
              <ImageIcon size={15} className="text-[#990011]" />
              <span className="hidden sm:inline text-[11px]">
                {ce.image || "Image"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleMediaUpload(index, e.target.files[0]);
                  }
                  e.target.value = "";
                }}
              />
            </label>

            {/* Audio Upload Icon Button */}
            <label
              className="p-1.5 border border-border bg-white hover:bg-gray-100 text-gray-600 hover:text-[#990011] rounded-xl cursor-pointer flex items-center gap-1 text-xs font-bold transition-all shadow-xs"
              title={ce.uploadAudio || "Upload audio"}
            >
              <MusicIcon size={15} className="text-[#990011]" />
              <span className="hidden sm:inline text-[11px]">
                {ce.audio || "Audio"}
              </span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleAudioUpload(index, e.target.files[0]);
                  }
                  e.target.value = "";
                }}
              />
            </label>

            {/* Points field */}
            <div className="flex items-center gap-1.5 ml-0.5 sm:ml-1">
              <span className="text-xs font-bold text-gray-500 shrink-0">
                {ce.point || "Điểm"}:
              </span>
              <input
                type="number"
                min="0.1"
                step="any"
                value={question.score ?? ""}
                onChange={(e) =>
                  handleScoreChange(index, e.target.value)
                }
                className="w-14 sm:w-16 px-1.5 py-1.5 bg-gray-50 border border-border rounded-xl text-center text-xs font-extrabold text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] transition-all"
                placeholder="5"
              />
            </div>
          </div>
        </div>

        {collapsed ? (
          /* Collapsed summary of question text */
          <div className="text-xs font-semibold text-gray-450 truncate min-w-0 pl-0 sm:pl-8 leading-tight select-none italic pb-2">
            {question.content
              ? question.content
              : ce.noQuestionContentParenthetical ||
              "(No question content yet)"}
          </div>
        ) : (
          /* Expanded full editor fields */
          <>
            {/* Image Media Preview (Image on top) */}
            {question.mediaUrl && !question.clearMedia && (
              <div className="relative rounded-2xl overflow-hidden max-h-64 border border-border bg-gray-50 flex items-center justify-center p-2 group/img">
                <img
                  src={question.mediaUrl}
                  alt={(
                    ce.questionImageAlt ||
                    "Illustration for question {{number}}"
                  ).replace("{{number}}", index + 1)}
                  className="max-h-60 max-w-full object-contain rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMedia(index)}
                  className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer shadow-md"
                  title={ce.removeImage || "Remove image"}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Audio Player (Audio play below image) */}
            {question.audioUrl && !question.clearAudio && (
              <div className="relative p-3 bg-red-50/20 border border-red-100 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#990011] text-white flex items-center justify-center shrink-0">
                    <MusicIcon size={16} />
                  </div>
                  <audio
                    controls
                    src={question.audioUrl}
                    className="w-full h-9 rounded-xl"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAudio(index)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                  title={ce.removeAudio || "Remove audio"}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            {/* Content input */}
            <textarea
              value={question.content}
              onChange={(e) =>
                handleQuestionContentChange(index, e.target.value)
              }
              placeholder={
                ce.questionContentPlaceholder ||
                "Enter question content..."
              }
              className="w-full p-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] resize-none h-18 transition-all"
            />

            {/* Type-Specific Options Area */}
            {question.type === "MultipleChoiceSingle" || question.type === "mcq" ? (
              <div className="flex flex-col gap-3 pl-0 sm:pl-2">
                <span className="text-xs font-bold text-gray-500">
                  {ce.singleChoiceInstruction ||
                    "Options (select 1 correct answer):"}
                </span>
                {(question.options || []).map((opt, optIdx) => {
                  const isCorrect = (question.correctAnswers || []).includes(
                    String(optIdx),
                  );
                  return (
                    <div
                      key={optIdx}
                      className="flex items-center gap-2 sm:gap-3 group/opt min-w-0"
                    >
                      {/* Radio Selection */}
                      <button
                        type="button"
                        onClick={() =>
                          handleSingleCorrectAnswer(index, optIdx)
                        }
                        className={`w-5 h-5 border rounded-full flex items-center justify-center transition-all shrink-0 ${isCorrect
                          ? "border-[#990011] bg-red-50/10"
                          : "border-gray-300 hover:border-gray-400"
                          }`}
                      >
                        {isCorrect && (
                          <span className="w-2.5 h-2.5 bg-[#990011] rounded-full" />
                        )}
                      </button>

                      {/* Option Input */}
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) =>
                          handleOptionTextChange(
                            index,
                            optIdx,
                            e.target.value,
                          )
                        }
                        placeholder={(
                          ce.optionPlaceholder || "Option {{letter}}"
                        ).replace(
                          "{{letter}}",
                          String.fromCharCode(65 + optIdx),
                        )}
                        className={`flex-1 min-w-0 px-3 py-2 border rounded-xl text-xs focus:outline-none transition-all ${isCorrect
                          ? "border-red-200 bg-red-50/10 focus:ring-1 focus:ring-red-100 focus:border-[#990011]"
                          : "border-border focus:ring-1 focus:ring-red-100 focus:border-gray-300"
                          }`}
                      />

                      {/* Remove option button */}
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveOption(index, optIdx)
                        }
                        className="text-gray-400 hover:text-red-600 transition-colors p-1 shrink-0"
                        title={ce.deleteOption || "Delete option"}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}

                {/* Add Option Trigger */}
                <button
                  type="button"
                  onClick={() => handleAddOption(index)}
                  className="text-xs font-bold text-[#990011] flex items-center gap-1.5 hover:underline pl-0 sm:pl-8"
                >
                  <Plus size={14} />
                  <span>{ce.addOption || "Thêm lựa chọn"}</span>
                </button>
              </div>
            ) : question.type === "MultipleChoiceMultiple" ? (
              <div className="flex flex-col gap-3 pl-0 sm:pl-2">
                <span className="text-xs font-bold text-gray-500">
                  {ce.multipleChoiceInstruction ||
                    "Options (select 1 or more correct answers):"}
                </span>
                {(question.options || []).map((opt, optIdx) => {
                  const isCorrect = (question.correctAnswers || []).includes(
                    String(optIdx),
                  );
                  return (
                    <div
                      key={optIdx}
                      className="flex items-center gap-2 sm:gap-3 group/opt min-w-0"
                    >
                      <input
                        type="checkbox"
                        checked={isCorrect}
                        onChange={() =>
                          handleMultipleCorrectAnswerToggle(
                            index,
                            optIdx,
                          )
                        }
                        className="w-5 h-5 shrink-0 rounded border-gray-300 text-[#990011] focus:ring-[#990011] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) =>
                          handleOptionTextChange(
                            index,
                            optIdx,
                            e.target.value,
                          )
                        }
                        placeholder={(
                          ce.optionPlaceholder || "Option {{letter}}"
                        ).replace(
                          "{{letter}}",
                          String.fromCharCode(65 + optIdx),
                        )}
                        className={`flex-1 min-w-0 px-3 py-2 border rounded-xl text-xs focus:outline-none transition-all ${isCorrect
                          ? "border-red-200 bg-red-50/10 focus:ring-1 focus:ring-red-100 focus:border-[#990011]"
                          : "border-border focus:ring-1 focus:ring-red-100 focus:border-gray-300"
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveOption(index, optIdx)
                        }
                        className="text-gray-400 hover:text-red-600 transition-colors p-1 shrink-0"
                        title={ce.deleteOption || "Delete option"}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => handleAddOption(index)}
                  className="text-xs font-bold text-[#990011] flex items-center gap-1.5 hover:underline pl-0 sm:pl-8"
                >
                  <Plus size={14} />
                  <span>{ce.addOption || "Thêm lựa chọn"}</span>
                </button>
              </div>
            ) : question.type === "TrueFalse" ? (
              <div className="flex flex-col gap-3 pl-0 sm:pl-2">
                <span className="text-xs font-bold text-gray-500">
                  {ce.selectCorrectAnswer ||
                    "Select the correct answer:"}
                </span>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                    <input
                      type="radio"
                      name={`tf-${question.id}`}
                      checked={(question.correctAnswers || [])[0] === "0"}
                      onChange={() =>
                        handleSingleCorrectAnswer(index, 0)
                      }
                      className="w-4 h-4 text-[#990011] focus:ring-[#990011]"
                    />
                    <span>{ce.trueLabel || "True"}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                    <input
                      type="radio"
                      name={`tf-${question.id}`}
                      checked={(question.correctAnswers || [])[0] === "1"}
                      onChange={() =>
                        handleSingleCorrectAnswer(index, 1)
                      }
                      className="w-4 h-4 text-[#990011] focus:ring-[#990011]"
                    />
                    <span>{ce.falseLabel || "False"}</span>
                  </label>
                </div>
              </div>
            ) : question.type === "FillInBlank" ? (
              <div className="flex flex-col gap-2 pl-0 sm:pl-2">
                <label className="text-xs font-bold text-gray-700">
                  {ce.fillBlankCorrectAnswer ||
                    "Correct answer for the blank:"}
                </label>
                <input
                  type="text"
                  value={(question.correctAnswers || [""])[0] || ""}
                  onChange={(e) =>
                    handleFillInBlankAnswerChange(index, e.target.value)
                  }
                  placeholder={
                    ce.fillBlankPlaceholder ||
                    "Enter the correct answer..."
                  }
                  className="w-full max-w-md px-3 py-2 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-red-100 focus:border-[#990011]"
                />
              </div>
            ) : (
              /* Essay View */
              <div className="flex flex-col gap-3 pl-0 sm:pl-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <label className="text-xs font-bold text-gray-700">
                    {ce.maxWordCount || "Maximum word count:"}
                  </label>
                  <input
                    type="number"
                    value={question.maxWordCount || 500}
                    onChange={(e) =>
                      handleMaxWordCountChange(index, e.target.value)
                    }
                    className="w-24 px-3 py-1.5 border border-border rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-red-100 focus:border-[#990011]"
                  />
                </div>
                <div className="bg-gray-50 border border-border rounded-2xl p-4 text-xs text-gray-400 font-medium italic">
                  {ce.essayResponseHelp ||
                    "Student essay response area."}
                </div>
              </div>
            )}

            {/* Skill Tag & Tip Text Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border">
              {/* Skill Tag */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                  {ce.skillTag || "Skill tag / topic"}
                </label>
                <input
                  type="text"
                  value={question.skillTag || ""}
                  onChange={(e) => handleSkillTagChange(index, e.target.value)}
                  placeholder={
                    ce.skillTagPlaceholder ||
                    "e.g. Grammar, Vocabulary..."
                  }
                  className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-100 focus:border-[#990011]"
                />
              </div>

              {/* Tip Text */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                  {ce.tipText || "Tip / hint"}
                </label>
                <input
                  type="text"
                  value={question.tipText || ""}
                  onChange={(e) => handleTipTextChange(index, e.target.value)}
                  placeholder={
                    ce.tipTextPlaceholder || "Hint for students..."
                  }
                  className="w-full px-3 py-1.5 bg-gray-50 border border-border rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-100 focus:border-[#990011]"
                />
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full my-1" />

            {/* Actions footer of card */}
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                {/* Copy */}
                <button
                  type="button"
                  onClick={() => handleCopyQuestion(index)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                  title={ce.copyQuestion || "Copy question"}
                >
                  <Copy size={16} />
                </button>
                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(index)}
                  className="p-2 text-gray-400 hover:text-red-650 hover:bg-red-55/20 rounded-xl transition-all"
                  title={ce.deleteQuestion || "Delete question"}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Required Switch */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">
                  {ce.requiredLabel || "Bắt buộc"}
                </span>
                <Switch
                  checked={Boolean(question.required)}
                  onChange={() => handleRequiredToggle(index)}
                  colorClass="peer-checked:bg-[#990011]"
                  size="sm"
                  aria-label={ce.requiredQuestion || "Required question"}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(QuestionCard);
