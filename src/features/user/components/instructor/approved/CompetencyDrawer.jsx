import React, { useState, useEffect } from "react"
import {
  Plus,
  Trash2,
  GraduationCap,
  Briefcase,
  Award,
  Lightbulb,
  X,
} from "lucide-react"
import ProfileDrawer from "@/features/user/components/instructor/ProfileDrawer"
import { useUpdateInstructorCompetencyMutation } from "@/store/api/instructorApi"
import { toast } from "@/shared/utils/toastBridge"
import { parseApiError } from "@/shared/utils/apiError"

/**
 * Drawer chỉnh sửa Hồ sơ Năng lực Giảng viên (Ticket 10)
 */
const CompetencyDrawer = ({ open, onClose, competencyData, t }) => {
  const ins = t.profile?.instructor || {}
  const [updateCompetency, { isLoading: isSubmitting }] =
    useUpdateInstructorCompetencyMutation()

  // ─── Form State ───
  const [headline, setHeadline] = useState("")
  const [teachingMotto, setTeachingMotto] = useState("")
  const [education, setEducation] = useState([])
  const [experience, setExperience] = useState([])
  const [certificates, setCertificates] = useState([])
  const [methodTags, setMethodTags] = useState([])
  const [tagInput, setTagInput] = useState("")
  const [methodDescription, setMethodDescription] = useState("")

  // Load initial values from competencyData
  useEffect(() => {
    if (!open) return
    const comp = competencyData?.data || competencyData || {}
    setHeadline(comp.headline || "")
    setTeachingMotto(comp.teachingMotto || "")
    setEducation(Array.isArray(comp.education) ? [...comp.education] : [])
    setExperience(Array.isArray(comp.experience) ? [...comp.experience] : [])
    setCertificates(
      Array.isArray(comp.certificates) ? [...comp.certificates] : []
    )
    setMethodTags(
      Array.isArray(comp.teachingMethods?.tags)
        ? [...comp.teachingMethods.tags]
        : []
    )
    setMethodDescription(comp.teachingMethods?.description || "")
    setTagInput("")
  }, [open, competencyData])

  // ─── Education Handlers ───
  const handleAddEducation = () => {
    setEducation((prev) => [
      ...prev,
      { school: "", major: "", period: "", degreeGrade: "" },
    ])
  }
  const handleUpdateEducation = (index, field, value) => {
    setEducation((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }
  const handleRemoveEducation = (index) => {
    setEducation((prev) => prev.filter((_, i) => i !== index))
  }

  // ─── Experience Handlers ───
  const handleAddExperience = () => {
    setExperience((prev) => [
      ...prev,
      {
        role: "",
        organization: "",
        period: "",
        yearsCount: undefined,
        isCurrent: false,
        location: "",
        description: "",
      },
    ])
  }
  const handleUpdateExperience = (index, field, value) => {
    setExperience((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }
  const handleRemoveExperience = (index) => {
    setExperience((prev) => prev.filter((_, i) => i !== index))
  }

  // ─── Certificates Handlers ───
  const handleAddCertificate = () => {
    setCertificates((prev) => [
      ...prev,
      { name: "", scoreDetails: "", issuedBy: "", issuedYear: "" },
    ])
  }
  const handleUpdateCertificate = (index, field, value) => {
    setCertificates((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }
  const handleRemoveCertificate = (index) => {
    setCertificates((prev) => prev.filter((_, i) => i !== index))
  }

  // ─── Method Tags Handlers ───
  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (!trimmed) return
    if (!methodTags.includes(trimmed)) {
      setMethodTags((prev) => [...prev, trimmed])
    }
    setTagInput("")
  }
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }
  const handleRemoveTag = (tagToRemove) => {
    setMethodTags((prev) => prev.filter((t) => t !== tagToRemove))
  }

  // ─── Save Changes ───
  const handleSubmit = async () => {
    const payload = {
      headline: headline.trim() || null,
      teachingMotto: teachingMotto.trim() || null,
      education: education
        .filter((e) => e.school?.trim())
        .map((e) => ({
          school: e.school.trim(),
          major: e.major?.trim() || null,
          period: e.period?.trim() || null,
          degreeGrade: e.degreeGrade?.trim() || null,
        })),
      experience: experience
        .filter((e) => e.role?.trim() || e.organization?.trim())
        .map((e) => ({
          role: e.role?.trim() || null,
          organization: e.organization?.trim() || null,
          period: e.period?.trim() || null,
          yearsCount: e.yearsCount ? Number(e.yearsCount) : null,
          isCurrent: Boolean(e.isCurrent),
          location: e.location?.trim() || null,
          description: e.description?.trim() || null,
        })),
      certificates: certificates
        .filter((c) => c.name?.trim())
        .map((c) => ({
          name: c.name.trim(),
          scoreDetails: c.scoreDetails?.trim() || null,
          issuedBy: c.issuedBy?.trim() || null,
          issuedYear: c.issuedYear?.trim() || null,
        })),
      teachingMethods:
        methodTags.length > 0 || methodDescription.trim()
          ? {
              tags: methodTags,
              description: methodDescription.trim() || null,
            }
          : null,
    }

    try {
      await updateCompetency(payload).unwrap()
      toast.success(
        ins.competencySaveSuccess || "Cập nhật hồ sơ năng lực thành công"
      )
      onClose()
    } catch (err) {
      const { message } = parseApiError(err)
      toast.error(
        message ||
          ins.competencySaveError ||
          "Không thể lưu hồ sơ năng lực. Vui lòng thử lại."
      )
    }
  }

  return (
    <ProfileDrawer
      open={open}
      onClose={onClose}
      title={ins.editCompetencyProfile || "Chỉnh sửa hồ sơ năng lực"}
      primaryLabel={isSubmitting ? "Đang lưu..." : ins.saveChanges || "Lưu thay đổi"}
      onPrimary={handleSubmit}
      primaryDisabled={isSubmitting}
      secondaryLabel={ins.cancel || "Hủy"}
      onSecondary={onClose}
      className="max-w-2xl sm:max-w-2xl"
    >
      <div className="flex flex-col gap-6 py-2">
        {/* ─── 1. Chuyên môn hiển thị ─── */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {ins.headlineLabel || "Chuyên môn hiển thị (Headline)"}
          </label>
          <input
            type="text"
            maxLength={250}
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Ví dụ: Giảng viên chuyên môn IELTS & Giao tiếp quốc tế"
            className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#990011] focus:border-[#990011]"
          />
          <span className="text-[11px] text-slate-400 text-right">
            {headline.length}/250
          </span>
        </div>

        {/* ─── 2. Phương châm / Trích dẫn giảng dạy ─── */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {ins.teachingMottoLabel || "Phương châm / Triết lý giảng dạy"}
          </label>
          <textarea
            rows={3}
            maxLength={1000}
            value={teachingMotto}
            onChange={(e) => setTeachingMotto(e.target.value)}
            placeholder="Ví dụ: Học thật, ứng dụng thật và tạo dựng tư duy phản xạ ngôn ngữ tự nhiên lên hàng đầu."
            className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#990011] focus:border-[#990011] resize-none"
          />
          <span className="text-[11px] text-slate-400 text-right">
            {teachingMotto.length}/1000
          </span>
        </div>

        {/* ─── 3. Chứng chỉ & Bằng cấp (Certificates Repeater) ─── */}
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-amber-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {ins.certificatesLabel || "Chứng chỉ & Bằng cấp"}
              </h4>
            </div>
            <button
              type="button"
              onClick={handleAddCertificate}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#990011] hover:underline cursor-pointer"
            >
              <Plus size={14} />
              <span>{ins.addCertificate || "Thêm chứng chỉ"}</span>
            </button>
          </div>

          {certificates.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
              Chưa có chứng chỉ nào. Nhấn "Thêm chứng chỉ" để bắt đầu.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {certificates.map((cert, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3 relative"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveCertificate(index)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                    <input
                      type="text"
                      placeholder="Tên chứng chỉ (VD: IELTS 8.5 Overall)"
                      value={cert.name}
                      onChange={(e) =>
                        handleUpdateCertificate(index, "name", e.target.value)
                      }
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Điểm số chi tiết (VD: L: 9.0 · R: 9.0 · W: 8.0 · S: 8.0)"
                      value={cert.scoreDetails || ""}
                      onChange={(e) =>
                        handleUpdateCertificate(
                          index,
                          "scoreDetails",
                          e.target.value
                        )
                      }
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Nơi cấp (VD: British Council)"
                      value={cert.issuedBy || ""}
                      onChange={(e) =>
                        handleUpdateCertificate(
                          index,
                          "issuedBy",
                          e.target.value
                        )
                      }
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Năm cấp (VD: 2021)"
                      value={cert.issuedYear || ""}
                      onChange={(e) =>
                        handleUpdateCertificate(
                          index,
                          "issuedYear",
                          e.target.value
                        )
                      }
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── 4. Học vấn (Education Repeater) ─── */}
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap size={16} className="text-blue-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {ins.educationLabel || "Học vấn"}
              </h4>
            </div>
            <button
              type="button"
              onClick={handleAddEducation}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#990011] hover:underline cursor-pointer"
            >
              <Plus size={14} />
              <span>{ins.addEducation || "Thêm học vấn"}</span>
            </button>
          </div>

          {education.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
              Chưa có thông tin học vấn nào. Nhấn "Thêm học vấn" để bắt đầu.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {education.map((edu, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3 relative"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(index)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                    <input
                      type="text"
                      placeholder="Trường đại học (VD: Đại học Hà Nội)"
                      value={edu.school}
                      onChange={(e) =>
                        handleUpdateEducation(index, "school", e.target.value)
                      }
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Chuyên ngành (VD: Thạc sĩ Ngôn ngữ Anh)"
                      value={edu.major || ""}
                      onChange={(e) =>
                        handleUpdateEducation(index, "major", e.target.value)
                      }
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Niên khóa (VD: 2017 – 2019)"
                      value={edu.period || ""}
                      onChange={(e) =>
                        handleUpdateEducation(index, "period", e.target.value)
                      }
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Xếp loại / Bằng cấp (VD: Tốt nghiệp loại Giỏi)"
                      value={edu.degreeGrade || ""}
                      onChange={(e) =>
                        handleUpdateEducation(
                          index,
                          "degreeGrade",
                          e.target.value
                        )
                      }
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── 5. Kinh nghiệm giảng dạy (Experience Repeater) ─── */}
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {ins.experienceLabel || "Kinh nghiệm giảng dạy"}
              </h4>
            </div>
            <button
              type="button"
              onClick={handleAddExperience}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#990011] hover:underline cursor-pointer"
            >
              <Plus size={14} />
              <span>{ins.addExperience || "Thêm kinh nghiệm"}</span>
            </button>
          </div>

          {experience.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
              Chưa có thông tin kinh nghiệm nào. Nhấn "Thêm kinh nghiệm" để bắt đầu.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {experience.map((exp, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3 relative"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(index)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                    <input
                      type="text"
                      placeholder="Chức vụ (VD: Giảng viên IELTS cao cấp)"
                      value={exp.role || ""}
                      onChange={(e) =>
                        handleUpdateExperience(index, "role", e.target.value)
                      }
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Tổ chức / Trung tâm (VD: Lumina Academy)"
                      value={exp.organization || ""}
                      onChange={(e) =>
                        handleUpdateExperience(
                          index,
                          "organization",
                          e.target.value
                        )
                      }
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Thời gian công tác (VD: 2021 – Nay)"
                      value={exp.period || ""}
                      onChange={(e) =>
                        handleUpdateExperience(index, "period", e.target.value)
                      }
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
                    />
                    <input
                      type="number"
                      placeholder="Số năm kinh nghiệm (VD: 3)"
                      value={exp.yearsCount ?? ""}
                      onChange={(e) =>
                        handleUpdateExperience(
                          index,
                          "yearsCount",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Địa điểm (VD: Hà Nội, Việt Nam)"
                      value={exp.location || ""}
                      onChange={(e) =>
                        handleUpdateExperience(index, "location", e.target.value)
                      }
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 sm:col-span-2"
                    />
                  </div>

                  {/* Checkbox Hiện đang làm việc */}
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={Boolean(exp.isCurrent)}
                      onChange={(e) =>
                        handleUpdateExperience(index, "isCurrent", e.target.checked)
                      }
                      className="rounded text-[#990011] focus:ring-[#990011]"
                    />
                    <span>Hiện đang làm việc tại đây</span>
                  </label>

                  {/* Mô tả chi tiết */}
                  <textarea
                    rows={2}
                    placeholder="Mô tả công việc và đóng góp chi tiết..."
                    value={exp.description || ""}
                    onChange={(e) =>
                      handleUpdateExperience(index, "description", e.target.value)
                    }
                    className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 resize-none"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── 6. Phương pháp giảng dạy (Teaching Methods) ─── */}
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Lightbulb size={16} className="text-amber-500" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {ins.teachingMethodsLabel || "Phương pháp giảng dạy"}
            </h4>
          </div>

          {/* Tags list + tag input */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nhập từ khóa phương pháp (nhấn Enter để thêm)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3.5 h-9 rounded-lg bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors"
              >
                Thêm
              </button>
            </div>

            {methodTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {methodTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 text-[#990011] text-xs font-bold border border-red-100"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-800 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description textarea */}
          <textarea
            rows={4}
            placeholder="Mô tả chi tiết phương pháp, kỹ thuật và cách tiếp cận trong giờ dạy..."
            value={methodDescription}
            onChange={(e) => setMethodDescription(e.target.value)}
            className="p-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#990011] focus:border-[#990011] resize-none mt-1"
          />
        </div>
      </div>
    </ProfileDrawer>
  )
}

export default CompetencyDrawer
