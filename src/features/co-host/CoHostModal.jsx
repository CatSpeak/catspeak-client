import React, { useMemo, useState } from "react"
import { ChevronDown, Search, X } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import {
  CO_HOST_GROUPS,
  CO_HOST_PERMISSION_LABELS,
  CO_HOST_ALL,
  countByGroup,
} from "./constants"

/**
 * Phân công Co-host popup — theo SRS Màn hình 2 (cohost-3.png):
 * 1. Chọn người dùng (dropdown + search, X chỉ clear form)
 * 2. Chọn quyền cho Co-host (2 nhóm + đếm realtime x/6, x/5 + Chọn nhanh)
 * Lưu ý: Quyền của co-host chỉ áp dụng cho mỗi lớp học.
 * Nút Phân công disable khi chưa thay đổi gì trên form.
 */
const CoHostModal = ({
  open,
  onClose,
  title = "Phân công Co-host",
  candidates = [],
  initialAccountId = null,
  initialPermissions = [],
  confirmLabel = "Phân công Co-host",
  isSaving = false,
  serverError = "",
  onSubmit,
}) => {
  const [query, setQuery] = useState("")
  const [listOpen, setListOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(initialAccountId)
  const [permissions, setPermissions] = useState(initialPermissions || [])
  const [quickOpen, setQuickOpen] = useState(false)

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
    setQuickOpen(false)
    setSelectedId(initialAccountId)
    setPermissions(initialPermissions || [])
  }
  if (!open && prevOpenKey !== null) {
    setPrevOpenKey(null)
  }

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

  const handleSelect = (id) => {
    setSelectedId(id)
    setListOpen(false)
  }

  // X chỉ clear form (chọn lại người khác), không revoke — revoke có confirm riêng.
  const handleClearUser = () => {
    setSelectedId(null)
    setQuery("")
    setListOpen(true)
  }

  const handleQuick = (mode) => {
    if (mode === "all") setPermissions([...CO_HOST_ALL])
    if (mode === "none") setPermissions([])
    setQuickOpen(false)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      showCloseButton
      className="md:max-w-2xl"
      bodyClassName="px-4 sm:px-6 flex flex-col gap-5 flex-1 overflow-y-auto max-h-[70vh]"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <PillButton variant="secondary" onClick={onClose} disabled={isSaving}>
            Hủy
          </PillButton>
          <PillButton
            onClick={() =>
              onSubmit?.({ coHostAccountId: selectedId, permissions })
            }
            disabled={!canSubmit}
            loading={isSaving}
            loadingText="Đang lưu..."
          >
            {confirmLabel}
          </PillButton>
        </div>
      }
    >
      {/* 1. Chọn người dùng */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold">1. Chọn người dùng</p>
        <label className="text-xs text-gray-500">Người dùng *</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setListOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-sm bg-white hover:border-gray-400"
          >
            <span className="flex items-center gap-2 min-w-0">
              {selectedUser ? (
                <>
                  <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {(selectedUser.name || "?").slice(0, 2).toUpperCase()}
                  </span>
                  <span className="truncate font-semibold">
                    {selectedUser.name}
                  </span>
                  {selectedUser.email && (
                    <span className="truncate text-gray-400 text-xs hidden sm:inline">
                      {selectedUser.email}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-gray-400">
                  Tìm kiếm theo tên hoặc email
                </span>
              )}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              {selectedUser && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Xóa người dùng đã chọn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClearUser()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation()
                      handleClearUser()
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
                >
                  <X size={14} />
                </span>
              )}
              <ChevronDown size={16} className="text-gray-400" />
            </span>
          </button>

          {listOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border bg-white shadow-lg overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b">
                <Search size={14} className="text-gray-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm kiếm theo tên hoặc email"
                  className="w-full text-sm outline-none"
                />
              </div>
              <div className="max-h-52 overflow-y-auto">
                {filtered.length === 0 && (
                  <p className="px-3 py-4 text-sm text-gray-400">
                    Không tìm thấy người dùng phù hợp.
                  </p>
                )}
                {filtered.map((c) => (
                  <button
                    key={c.accountId}
                    type="button"
                    onClick={() => handleSelect(c.accountId)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                  >
                    <span className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {(c.name || "?").slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {c.name}
                        {c.badge && (
                          <span className="ml-2 rounded-full bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 font-bold">
                            {c.badge}
                          </span>
                        )}
                      </span>
                      {c.email && (
                        <span className="block truncate text-xs text-gray-400">
                          {c.email}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Chọn quyền */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">2. Chọn quyền cho Co-host</p>
          <div className="relative">
            <button
              type="button"
              onClick={() => setQuickOpen((v) => !v)}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              Chọn nhanh <ChevronDown size={12} />
            </button>
            {quickOpen && (
              <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border bg-white shadow-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleQuick("all")}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50"
                >
                  Chọn tất cả (11)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuick("none")}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50"
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Chọn các quyền mà Co-host sẽ có trong lớp học này
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          {CO_HOST_GROUPS.map((g) => (
            <div key={g.id} className="rounded-xl border p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold">{g.title}</p>
                <span className="text-[11px] text-gray-400">
                  {counts[g.id] ?? 0}/{g.total}
                </span>
              </div>
              {g.permissions.map((code) => (
                <label
                  key={code}
                  className="flex items-start gap-2 text-xs cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(code)}
                    onChange={() => togglePerm(code)}
                    className="mt-0.5 h-4 w-4 accent-blue-600"
                  />
                  <span>{CO_HOST_PERMISSION_LABELS[code]}</span>
                </label>
              ))}
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-blue-50 text-blue-700 text-xs px-3 py-2.5 flex gap-2">
          <span className="font-bold">Lưu ý:</span>
          <span>Quyền của co-host chỉ áp dụng cho mỗi lớp học.</span>
        </div>

        {serverError && (
          <p role="alert" className="text-xs text-red-600 font-semibold">
            {serverError}
          </p>
        )}
      </div>
    </Modal>
  )
}

export default CoHostModal
