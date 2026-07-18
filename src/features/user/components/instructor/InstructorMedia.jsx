import React from "react"
import { Upload } from "lucide-react"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import FluentCard from "@/shared/components/ui/FluentCard"

const InstructorMedia = ({ formData, onChange, onSelectVideo, readOnly = false, errors = {}, t }) => {
  const ins = t.profile?.instructor || {}

  return (
    <div className="flex flex-col gap-10 mt-6">
      {/* Introduction */}
      <FluentCard className="gap-6 !justify-start">
        <h2 className="text-xl font-bold text-gray-900">
          {ins.introduceYourself || "Giới thiệu bản thân"}
        </h2>
        
        <div id="field-introduction" className="flex flex-col gap-2">
          <textarea
            name="introduction"
            value={formData.introduction}
            onChange={onChange}
            rows={5}
            disabled={readOnly}
            placeholder={ins.introPlaceholder || "Để duy trì hình ảnh chuyên nghiệp và phản ánh những phẩm chất lý tưởng của một giáo viên. (≤ 200-300 ký tự)"}
            className={`w-full bg-gray-50/50 border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors resize-none disabled:text-gray-500 ${errors.introduction ? "border-red-500 focus:border-red-500" : "border-gray-100 focus:border-red-200"}`}
          />
          {errors.introduction && <p className="text-xs text-red-500">{errors.introduction}</p>}
          {!errors.introduction && (
            <p className="text-[11px] text-gray-400">
              {ins.introPlaceholder || "Để duy trì hình ảnh chuyên nghiệp và phản ánh những phẩm chất lý tưởng của một giáo viên. (≤ 200-300 ký tự)"}
            </p>
          )}
        </div>
      </FluentCard>

      {/* Video */}
      <FluentCard id="field-videoFile" className="gap-4 !justify-start">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {ins.uploadVideo || "Video giới thiệu bản thân"}
          </h2>
          {!readOnly && (
            <PillButton
              onClick={onSelectVideo}
              startIcon={<Upload className="w-4 h-4" />}
              className="!h-9 !px-4"
            >
              {ins.videoLabel || "Tải video"}
            </PillButton>
          )}
        </div>
        
        {formData.videoFile ? (
          <div className="flex items-center justify-center w-full bg-gray-50/50 border border-gray-100 rounded-xl py-6">
            <span className="text-sm font-medium text-gray-600">
              {typeof formData.videoFile === "string" ? "Video đã tải lên" : formData.videoFile.name}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-1 w-full">
            <div className={`flex flex-col items-center justify-center w-full bg-gray-50/50 border rounded-xl py-8 px-4 text-center ${errors.videoFile ? "border-red-500 bg-red-50/10 border-solid" : "border-gray-100"}`}>
              <p className={`text-[12px] max-w-lg ${errors.videoFile ? "text-red-500" : "text-gray-400"}`}>
                {ins.videoNote || "Chúng tôi khuyến khích bạn tải lên video ngắn 1-3 phút giới thiệu bản thân để thu hút và gây ấn tượng với học viên tiềm năng. Video nên ở định dạng ngang (mp4) và dưới 500MB."}
              </p>
            </div>
            {errors.videoFile && <p className="text-xs text-red-500">{errors.videoFile}</p>}
          </div>
        )}
      </FluentCard>
    </div>
  )
}

export default InstructorMedia
