import React, { useMemo, useState, useEffect, useRef } from "react"
import {
  Crown,
  Search,
  X,
  ChevronDown,
  Users,
  ShieldCheck,
  Check,
  Sparkles,
  RefreshCw,
  Info,
  Mic,
  Video,
  MicOff,
  Volume2,
  UserX,
  UserCheck,
  Lock,
  Power,
  MonitorUp,
  Sliders,
  Disc,
  AlertTriangle,
} from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  CO_HOST_GROUPS,
  CO_HOST_PERMISSION_LABELS,
  CO_HOST_PERMISSION_META,
  CO_HOST_ALL,
  CO_HOST_PRESETS,
  countByGroup,
} from "./constants"

/**
 * Icon mapping cho từng quyền hạn Co-host
 */
const PERMISSION_ICONS = {
  mic_toggle: Mic,
  camera_toggle: Video,
  mute_all: MicOff,
  allow_self_unmute: Volume2,
  remove_student: UserX,
  admit_waiting: UserCheck,
  lock_class: Lock,
  end_class: Power,
  share_screen: MonitorUp,
  manage_student_share: Sliders,
  record: Disc,
}

/**
 * Co-host Assignment Modal — Cải tiến chuẩn UI/UX Pro Max:
 * - Header nhận diện Co-host sang trọng kèm badge ngữ cảnh phòng học.
 * - Bước 1: Chọn người dùng tối ưu (Search tức thì, Empty state rõ ràng, Selected User Card).
 * - Bước 2: Bảng cấu hình quyền hạn trực quan với 1-Click Presets, Toggle nhóm và Icon ngữ nghĩa.
 * - Checkbox tùy biến chuẩn Accessibility (Touch target >= 44px, Focus indicator).
 * - Scope notice banner thích ứng tên phòng và đếm tổng quyền hạn.
 */
const CoHostModal = ({
  open,
  onClose,
  title,
  roomName = "",
  roomType = "room", // "room" | "class"
  candidates = [],
  initialAccountId = null,
  initialPermissions = [],
  confirmLabel,
  isSaving = false,
  serverError = "",
  onSubmit,
}) => {
  const { t } = useLanguage()
  const defaultTitle = t.rooms?.coHost?.assignCoHost || "Phân công Co-host"
  const defaultConfirm = t.rooms?.coHost?.assignCoHost || "Phân công Co-host"
  const modalTitle = title || defaultTitle
  const submitLabel = confirmLabel || defaultConfirm

  const [query, setQuery] = useState("")
  const [listOpen, setListOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(initialAccountId)
  const [permissions, setPermissions] = useState(initialPermissions || [])
  const searchInputRef = useRef(null)

  // Reset form mỗi lần mở modal (render-time adjustment thay vì effect,
  // để trạng thái luôn đồng bộ với co-host hiện tại khi mở lại).
  const [prevOpenKey, setPrevOpenKey] = useState(null)
  const openKey = open
    ? `${initialAccountId ?? "none"}:${[...(initialPermissions || [])].sort().join(",")}`
    : null
  if (open && prevOpenKey !== openKey) {
    setPrevOpenKey(openKey)
    setQuery("")
    setListOpen(false)
    setSelectedId(initialAccountId)
    setPermissions(initialPermissions || [])
  }
  if (!open && prevOpenKey !== null) {
    setPrevOpenKey(null)
  }

  // Tự động focus vào ô tìm kiếm khi mở danh sách mà chưa chọn ai
  useEffect(() => {
    if (open && !selectedId && listOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [open, selectedId, listOpen])

  const selectedUser = useMemo(
    () => candidates.find((c) => String(c.accountId) === String(selectedId)),
    [candidates, selectedId],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return candidates
    return candidates.filter((c) =>
      `${c.name || ""} ${c.email || ""}`.toLowerCase().includes(q),
    )
  }, [candidates, query])

  const togglePerm = (code) => {
    setPermissions((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code],
    )
  }

  const baselineKey = useMemo(
    () =>
      JSON.stringify({
        id: initialAccountId,
        perms: [...(initialPermissions || [])].sort(),
      }),
    [initialAccountId, initialPermissions],
  )
  const currentKey = useMemo(
    () =>
      JSON.stringify({
        id: selectedId,
        perms: [...permissions].sort(),
      }),
    [selectedId, permissions],
  )
  const isDirty = baselineKey !== currentKey
  const canSubmit =
    selectedId != null && permissions.length > 0 && isDirty && !isSaving

  const counts = useMemo(() => countByGroup(permissions), [permissions])

  // Smart Presets
  const applyPreset = (presetKey) => {
    const presetList = CO_HOST_PRESETS[presetKey] || []
    setPermissions([...presetList])
  }

  const isAssistantPreset = useMemo(() => {
    const assistantSet = new Set(CO_HOST_PRESETS.ASSISTANT)
    return (
      permissions.length === CO_HOST_PRESETS.ASSISTANT.length &&
      permissions.every((p) => assistantSet.has(p))
    )
  }, [permissions])

  const isAllPreset = permissions.length === CO_HOST_ALL.length

  // Toggle toàn bộ quyền theo từng nhóm
  const handleToggleGroup = (group) => {
    const groupPerms = group.permissions
    const allSelectedInGroup = groupPerms.every((p) => permissions.includes(p))

    if (allSelectedInGroup) {
      setPermissions((prev) => prev.filter((p) => !groupPerms.includes(p)))
    } else {
      setPermissions((prev) => Array.from(new Set([...prev, ...groupPerms])))
    }
  }

  const handleSelect = (id) => {
    setSelectedId(id)
    setListOpen(false)
    setQuery("")
  }

  const handleClearUser = () => {
    setSelectedId(null)
    setQuery("")
    setListOpen(true)
  }

  // Helper giải thích lý do khi nút bị disable
  const validationHint = useMemo(() => {
    if (isSaving) return ""
    if (selectedId == null) {
      return (
        t.rooms?.coHost?.hintNoUser ||
        "Vui lòng chọn người dùng được phân công Co-host."
      )
    }
    if (permissions.length === 0) {
      return (
        t.rooms?.coHost?.hintNoPerms ||
        "Vui lòng chọn ít nhất 1 quyền hạn cho Co-host."
      )
    }
    if (!isDirty) {
      return (
        t.rooms?.coHost?.hintNoChange ||
        "Chưa có thay đổi nào so với quyền hạn hiện tại."
      )
    }
    return ""
  }, [selectedId, permissions.length, isDirty, isSaving, t])

  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseButton
      className="md:max-w-2xl rounded-3xl"
      headerClassName="px-6 py-5 border-b border-gray-100 flex items-center justify-between"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm ring-4 ring-amber-50">
            <Crown size={20} className="stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-tight">
              {modalTitle}
            </h2>
            {roomName ? (
              <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate max-w-[280px] sm:max-w-md">
                  {roomType === "class"
                    ? (t.rooms?.coHost?.scopeTypeClass || "Lớp học")
                    : (t.rooms?.coHost?.scopeTypeRoom || "Phòng")}
                  :{" "}
                  <span className="font-semibold text-gray-800">{roomName}</span>
                </span>
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-0.5">
                {t.rooms?.coHost?.headerSubtitle ||
                  "Chỉ định trợ giảng và quản lý quyền hạn điều hành phòng"}
              </p>
            )}
          </div>
        </div>
      }
      bodyClassName="px-5 sm:px-6 py-5 flex flex-col gap-4.5 flex-1 overflow-y-auto max-h-[75vh] scrollbar-thin scrollbar-thumb-gray-200"
      footerClassName="px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <div className="text-xs text-gray-400 text-center sm:text-left truncate w-full sm:w-auto">
            {validationHint && (
              <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium">
                <AlertTriangle size={13} className="shrink-0" />
                <span>{validationHint}</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 shrink-0">
            <PillButton
              variant="secondary"
              onClick={onClose}
              disabled={isSaving}
              className="h-10"
            >
              {t.rooms?.coHost?.cancel || "Hủy"}
            </PillButton>
            <PillButton
              onClick={() =>
                onSubmit?.({ coHostAccountId: selectedId, permissions })
              }
              disabled={!canSubmit}
              loading={isSaving}
              loadingText={t.rooms?.coHost?.saving || "Đang lưu..."}
              className="h-10"
            >
              {submitLabel}
            </PillButton>
          </div>
        </div>
      }
    >
      {/* ──────────────── NGƯỜI DÙNG ĐẢM NHIỆM ──────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cath-red-700 text-white text-[10px] font-bold shadow-xs">
              1
            </span>
            <p className="text-sm font-bold text-gray-900">
              {t.rooms?.coHost?.userSectionTitle || "Người dùng đảm nhiệm"}
            </p>
            <span className="text-xs text-cath-red-700 font-bold" title="Bắt buộc">*</span>
          </div>

          {selectedUser && (
            <button
              type="button"
              onClick={handleClearUser}
              className="text-xs font-semibold text-gray-500 hover:text-cath-red-700 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700/40 rounded-lg px-2 py-0.5"
            >
              <RefreshCw size={12} />
              <span>{t.rooms?.coHost?.changeUser || "Đổi người khác"}</span>
            </button>
          )}
        </div>

        {/* TRẠNG THÁI A: ĐÃ CHỌN NGƯỜI DÙNG -> SELECTED USER CARD */}
        {selectedUser ? (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 shadow-xs transition-all animate-in fade-in-50 duration-150">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                  {(selectedUser.name || "?").slice(0, 2).toUpperCase()}
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white"
                  title={t.rooms?.coHost?.inRoomStatus || "Đang trong phòng"}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 truncate">
                    {selectedUser.name}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 border border-amber-200">
                    <Crown size={10} />
                    {t.rooms?.coHost?.designatedBadge || "Co-host chỉ định"}
                  </span>
                </div>
                {selectedUser.email && (
                  <span className="text-xs text-gray-500 truncate block mt-0.5">
                    {selectedUser.email}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearUser}
              aria-label={t.rooms?.coHost?.removeUser || "Gỡ người dùng này"}
              className="p-1.5 rounded-xl hover:bg-amber-100/70 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
              title={t.rooms?.coHost?.removeUser || "Gỡ người dùng này"}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          /* TRẠNG THÁI B: CHƯA CHỌN NGƯỜI DÙNG -> SEARCH & CANDIDATE PICKER */
          <div className="relative">
            {candidates.length === 0 ? (
              <div className="p-3.5 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 text-center flex flex-col items-center justify-center gap-1.5">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-0.5">
                  <Users size={16} />
                </div>
                <p className="text-xs font-semibold text-gray-700">
                  {t.rooms?.coHost?.noCandidatesTitle ||
                    "Chưa có thành viên khả dụng trong phòng"}
                </p>
                <p className="text-[11px] text-gray-400 max-w-sm">
                  {t.rooms?.coHost?.noCandidatesDesc ||
                    "Chỉ những thành viên đang trực tuyến trong phòng mới có thể được chỉ định làm Co-host."}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus-within:border-cath-red-700 focus-within:ring-2 focus-within:ring-cath-red-700/20 transition-all shadow-xs">
                  <Search size={16} className="text-gray-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      setListOpen(true)
                    }}
                    onFocus={() => setListOpen(true)}
                    placeholder={
                      t.rooms?.coHost?.searchPlaceholder ||
                      "Tìm kiếm theo tên hoặc email thành viên..."
                    }
                    className="w-full text-sm outline-none bg-transparent placeholder:text-gray-400 text-gray-800"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                    >
                      <X size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setListOpen((v) => !v)}
                    className="text-gray-400 hover:text-gray-600 p-0.5 shrink-0"
                    aria-label="Đóng mở danh sách thành viên"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${listOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {listOpen && (
                  <div className="absolute z-30 mt-1.5 w-full rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden py-1 max-h-56 overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-150 scrollbar-thin scrollbar-thumb-gray-200">
                    {filtered.length === 0 ? (
                      <div className="px-4 py-4 text-xs text-gray-400 text-center">
                        {t.rooms?.coHost?.noUserFound ||
                          "Không tìm thấy thành viên nào phù hợp."}
                      </div>
                    ) : (
                      filtered.map((c) => (
                        <button
                          key={c.accountId}
                          type="button"
                          onClick={() => handleSelect(c.accountId)}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-amber-50/50 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0 border border-amber-300/60">
                              {(c.name || "?").slice(0, 2).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <span className="block truncate text-xs font-bold text-gray-800 group-hover:text-amber-900">
                                {c.name}
                              </span>
                              {c.email && (
                                <span className="block truncate text-[11px] text-gray-400">
                                  {c.email}
                                </span>
                              )}
                            </div>
                          </div>
                          {c.badge && (
                            <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 font-bold shrink-0">
                              {c.badge}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ──────────────── THIẾT LẬP QUYỀN HẠN ──────────────── */}
      <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
        {/* Header Phân quyền Co-host */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cath-red-700 text-white text-[10px] font-bold shadow-xs">
                2
              </span>
              <p className="text-sm font-bold text-gray-900">
                {t.rooms?.coHost?.permissionSectionTitle || "Thiết lập quyền hạn"}
              </p>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200/80">
                {(t.rooms?.coHost?.permissionsCount || "{count}/11 quyền").replace(
                  "{count}",
                  permissions.length,
                )}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 pl-7">
              {roomType === "class"
                ? (t.rooms?.coHost?.scopeDescriptionClass ||
                  "Chọn các quyền mà Co-host sẽ có trong lớp học này")
                : (t.rooms?.coHost?.scopeDescriptionRoom ||
                  "Chọn các quyền mà Co-host sẽ có trong phòng này")}
            </p>
          </div>
        </div>

        {/* Thanh Preset Thiết Lập Nhanh (Dedicated Toolbar) */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-gray-50/90 border border-gray-200/70 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold pl-0.5">
            <Sparkles size={13} className="text-amber-600 shrink-0" />
            <span>{t.rooms?.coHost?.quickPresetsLabel || "Gợi ý chọn nhanh:"}</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => applyPreset("ASSISTANT")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isAssistantPreset
                  ? "bg-amber-100 border-amber-300 text-amber-900 shadow-xs ring-2 ring-amber-200/60"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-amber-50/80 hover:border-amber-300 hover:text-amber-900"
              }`}
              title={t.rooms?.coHost?.presetAssistant || "Gói Trợ giảng"}
            >
              <Sparkles size={12} className="text-amber-600" />
              <span>{t.rooms?.coHost?.presetAssistant || "Gói Trợ giảng"}</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset("ALL")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isAllPreset
                  ? "bg-cath-red-50 border-cath-red-300 text-cath-red-700 shadow-xs ring-2 ring-cath-red-200/60"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              <Check size={12} />
              <span>{t.rooms?.coHost?.selectAll || "Chọn tất cả"}</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset("CLEAR")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all border bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300"
            >
              <RefreshCw size={11} />
              <span>{t.rooms?.coHost?.deselectAll || "Bỏ chọn"}</span>
            </button>
          </div>
        </div>

        {/* 2 Nhóm quyền xếp dạng thẻ Grid */}
        <div className="grid sm:grid-cols-2 gap-3.5">
          {CO_HOST_GROUPS.map((g) => {
            const isStudentGroup = g.id === "student_management"
            const groupCount = counts[g.id] ?? 0
            const isFullGroup = groupCount === g.total
            const isPartialGroup = groupCount > 0 && !isFullGroup
            const GroupIcon = isStudentGroup ? Users : ShieldCheck
            const groupTitle =
              g.id === "room_security" && roomType === "room"
                ? (t.rooms?.coHost?.groupRoomSecurity || "Bảo mật phòng")
                : t.rooms?.coHost?.groups?.[g.id] || g.title

            return (
              <div
                key={g.id}
                className="rounded-2xl border border-gray-200 bg-white p-3.5 flex flex-col gap-2.5 shadow-xs transition-shadow hover:shadow-sm"
              >
                {/* Header nhóm quyền kèm nút Toggle nhóm */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isStudentGroup
                          ? "bg-blue-50 text-blue-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      <GroupIcon size={14} />
                    </div>
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {groupTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                        isFullGroup
                          ? "bg-emerald-100 text-emerald-800"
                          : isPartialGroup
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {groupCount}/{g.total}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleGroup(g)}
                      className="text-[11px] font-semibold text-gray-500 hover:text-cath-red-700 hover:underline transition-colors"
                      title={
                        isFullGroup
                          ? (t.rooms?.coHost?.deselectGroup || "Bỏ nhóm")
                          : (t.rooms?.coHost?.selectGroup || "Chọn nhóm")
                      }
                    >
                      {isFullGroup
                        ? (t.rooms?.coHost?.deselectGroup || "Bỏ nhóm")
                        : (t.rooms?.coHost?.selectGroup || "Chọn nhóm")}
                    </button>
                  </div>
                </div>

                {/* Danh sách từng quyền trong nhóm */}
                <div className="flex flex-col gap-1">
                  {g.permissions.map((code) => {
                    const isChecked = permissions.includes(code)
                    const meta = CO_HOST_PERMISSION_META[code] || {}
                    const IconComponent = PERMISSION_ICONS[code] || ShieldCheck
                    const isDanger = meta.severity === "danger"
                    const isWarning = meta.severity === "warning"
                    const helperText =
                      t.rooms?.coHost?.permissionHelpers?.[code] || meta.helper

                    return (
                      <div
                        key={code}
                        role="checkbox"
                        aria-checked={isChecked}
                        tabIndex={0}
                        onClick={() => togglePerm(code)}
                        onKeyDown={(e) => {
                          if (e.key === " " || e.key === "Enter") {
                            e.preventDefault()
                            togglePerm(code)
                          }
                        }}
                        className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer transition-all min-h-[44px] select-none ${
                          isChecked
                            ? isDanger
                              ? "bg-red-50/50 border border-red-200/70 text-red-950"
                              : "bg-amber-50/40 border border-amber-200/60 text-gray-950"
                            : "hover:bg-gray-50 border border-transparent text-gray-700"
                        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-700/50`}
                      >
                        {/* Custom Checkbox */}
                        <div
                          className={`mt-0.5 h-4 w-4 rounded-md flex items-center justify-center shrink-0 transition-all ${
                            isChecked
                              ? isDanger
                                ? "bg-red-600 text-white shadow-xs"
                                : "bg-cath-red-700 text-white shadow-xs"
                              : "border border-gray-300 bg-white hover:border-gray-400"
                          }`}
                        >
                          {isChecked && <Check size={11} className="stroke-[3]" />}
                        </div>

                        {/* Semantic Permission Icon */}
                        <div
                          className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                            isChecked
                              ? isDanger
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <IconComponent size={12} />
                        </div>

                        {/* Text Label & Helper */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold leading-tight block truncate">
                              {t.rooms?.coHost?.permissions?.[code] ||
                                CO_HOST_PERMISSION_LABELS[code]}
                            </span>
                            {isDanger && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700 shrink-0">
                                {t.rooms?.coHost?.badgeSensitive || "Nhạy cảm"}
                              </span>
                            )}
                            {isWarning && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 shrink-0">
                                {t.rooms?.coHost?.badgeCaution || "Chú ý"}
                              </span>
                            )}
                          </div>
                          {helperText && (
                            <p className="text-[10px] text-gray-400 leading-tight mt-0.5 line-clamp-1">
                              {helperText}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Scope notice banner */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-50/90 to-orange-50/70 border border-amber-200/80 text-amber-900 text-xs px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1 rounded-lg bg-amber-100 text-amber-800 shrink-0">
              <Info size={15} />
            </div>
            <p className="text-xs text-amber-950 leading-relaxed truncate">
              <span className="font-bold">{t.rooms?.coHost?.note || "Lưu ý:"}</span>{" "}
              {roomName
                ? (roomType === "class"
                    ? (t.rooms?.coHost?.scopeNoticeClass ||
                      'Quyền của Co-host chỉ có hiệu lực trong lớp học "{name}".')
                    : (t.rooms?.coHost?.scopeNoticeRoom ||
                      'Quyền của Co-host chỉ có hiệu lực trong phòng "{name}".')
                  ).replace("{name}", roomName)
                : (t.rooms?.coHost?.noteDesc || "Quyền của co-host chỉ áp dụng cho mỗi lớp học.")}
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-full shrink-0 border border-amber-200/60">
            {(t.rooms?.coHost?.permissionsCount || "{count}/11 quyền").replace(
              "{count}",
              permissions.length,
            )}
          </span>
        </div>

        {serverError && (
          <div
            role="alert"
            className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2"
          >
            <AlertTriangle size={15} className="shrink-0 text-red-600" />
            <span>{serverError}</span>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default CoHostModal
