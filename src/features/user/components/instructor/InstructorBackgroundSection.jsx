import React from "react"
import { Plus, Video, FileText } from "lucide-react"

const InstructorBackgroundSection = ({
  formData,
  onChange,
  onAddCredential,
  onSelectVideo,
  readOnly = false,
  t,
}) => {
  const ins = t.profile?.instructor || {}

  return (
    <div className="space-y-6">
      {/* --- Introduction Card --- */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-semibold text-[#990011] uppercase tracking-wide">
            {ins.background}
          </h2>
        </div>
        <div className="px-5 py-4">
          <label className="block text-xs font-medium text-gray-500 mb-2">
            {ins.introduceYourself}
          </label>
          <textarea
            name="introduction"
            value={formData.introduction}
            onChange={onChange}
            rows={4}
            placeholder={ins.introPlaceholder}
            disabled={readOnly}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] resize-none disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition"
          />
          <p className="text-xs text-gray-400 mt-2 italic">
            {ins.introPlaceholder}
          </p>
        </div>
      </div>

      {/* --- Credentials Card --- */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#990011] uppercase tracking-wide">
            {ins.uploadCredentials}
          </h2>
          {!readOnly && (
            <button
              type="button"
              onClick={onAddCredential}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#990011] hover:text-[#7a000d] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>
        <div className="px-5 py-4">
          <p className="text-xs text-red-500 mb-3">{ins.credentialsNote}</p>
          <div className="flex flex-wrap gap-3">
            {formData.credentials?.map((cred, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700 truncate max-w-[140px]">
                  {typeof cred === "string"
                    ? cred.split("/").pop()
                    : cred.name}
                </span>
              </div>
            ))}
            {(!formData.credentials || formData.credentials.length === 0) && (
              <p className="text-sm text-gray-400 italic">
                {readOnly ? "—" : "No credentials uploaded yet"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- Intro Video Card --- */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#990011] uppercase tracking-wide">
            {ins.uploadVideo}
          </h2>
          {!readOnly && (
            <button
              type="button"
              onClick={onSelectVideo}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#990011] hover:text-[#7a000d] transition"
            >
              <Video className="w-3.5 h-3.5" />
              {ins.videoLabel}
            </button>
          )}
        </div>
        <div className="px-5 py-4">
          {formData.videoFile ? (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <Video className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 truncate">
                {typeof formData.videoFile === "string"
                  ? formData.videoFile.split("/").pop()
                  : formData.videoFile.name}
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              {readOnly ? "—" : ins.videoNote}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default InstructorBackgroundSection
