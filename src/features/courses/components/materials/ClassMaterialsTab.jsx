import React, { useRef, useState } from "react"
import { Search, FileText, Trash2, Upload, X, Eye } from "lucide-react"
import { useGetClassMaterialsQuery, useUploadClassMaterialMutation, useDeleteClassMaterialMutation } from "@/store/api/coursesApi"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { toast } from "react-hot-toast"
import { formatFileSize, getFileIconColorClass } from "../../utils/courseUtils"
import { getFileMeta, getSafeFileUrl } from "../../utils/assignmentUtils"
import { useLanguage } from "@/shared/context/LanguageContext"

const MAX_MATERIAL_SIZE_BYTES = 15 * 1024 * 1024
const MATERIAL_DOCUMENT_EXTENSIONS = new Set(["pdf", "docx", "xlsx"])
const MATERIAL_IMAGE_EXTENSIONS = new Set([
  "bmp",
  "gif",
  "heic",
  "avif",
  "jpeg",
  "jpg",
  "png",
  "tif",
  "tiff",
  "webp",
])

const isRecord = (value) => (
  value !== null && typeof value === "object" && !Array.isArray(value)
)

const isMaterialItem = (value) => {
  if (typeof value === "string") return value.trim().length > 0
  if (!isRecord(value)) return false

  return [
    "id",
    "name",
    "fileName",
    "FileName",
    "url",
    "fileUrl",
    "FileUrl",
  ].some((key) => Object.prototype.hasOwnProperty.call(value, key))
}

const getMaterialList = (response) => {
  const payload = (
    isRecord(response)
    && Object.prototype.hasOwnProperty.call(response, "data")
  )
    ? response.data
    : response
  return Array.isArray(payload) ? payload : null
}

const getFileExtension = (fileName) => {
  const name = typeof fileName === "string" ? fileName : ""
  const dotIndex = name.lastIndexOf(".")
  return dotIndex >= 0 ? name.slice(dotIndex + 1).toLowerCase() : ""
}

const validateMaterialFile = (file) => {
  if (!file || typeof file.name !== "string") return "invalid"

  const size = Number(file.size)
  if (!Number.isFinite(size) || size <= 0) return "empty"
  if (size > MAX_MATERIAL_SIZE_BYTES) return "size"

  const extension = getFileExtension(file.name)
  const isSupportedDocument = MATERIAL_DOCUMENT_EXTENSIONS.has(extension)
  const isSupportedImage = MATERIAL_IMAGE_EXTENSIONS.has(extension)

  return isSupportedDocument || isSupportedImage ? null : "type"
}

const formatMaterialDate = (value, locale) => {
  if (!value) return ""

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  return date.toLocaleDateString(locale, { timeZone: "UTC" })
}

const formatMaterialSize = (value) => {
  const size = Number(value)
  return Number.isFinite(size) && size >= 0 && size < (1024 ** 4)
    ? formatFileSize(size)
    : "—"
}

const ClassMaterialsTab = ({ id, isStudent, cd = {}, cancelText }) => {
  const { language, t } = useLanguage()
  const cm = t.courses?.classMaterials || {}
  const dateLocale = language === "vi"
    ? "vi-VN"
    : language === "zh"
      ? "zh-CN"
      : "en-GB"
  const fileInputRef = useRef(null)
  const deleteInFlightRef = useRef(false)
  const uploadInFlightRef = useRef(false)

  const getFileIcon = (fileName) => {
    const colorClass = getFileIconColorClass(fileName)
    return <FileText className={colorClass} size={18} />
  }
  const {
    currentData: materialsResponse,
    isError: isMaterialsError,
    isFetching: isMaterialsFetching,
    isLoading: isMaterialsLoading,
    isSuccess: isMaterialsSuccess,
    refetch: refetchMaterials,
  } = useGetClassMaterialsQuery(id, { skip: !id || isStudent })
  const [uploadMaterial, { isLoading: isUploading }] = useUploadClassMaterialMutation()
  const [deleteMaterial] = useDeleteClassMaterialMutation()

  const [materialSearch, setMaterialSearch] = useState("")
  const [selectedUploadFile, setSelectedUploadFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [deleteMaterialData, setDeleteMaterialData] = useState(null)

  const rawMaterials = getMaterialList(materialsResponse)
  const hasMalformedResponse = isMaterialsSuccess && rawMaterials === null
  const hasMalformedItems = rawMaterials?.some((file) => !isMaterialItem(file)) ?? false
  const materialsList = (rawMaterials || []).filter(isMaterialItem)
  const normalizedSearch = materialSearch.trim().toLocaleLowerCase()
  const filteredMaterials = materialsList.filter((file) => {
    const { name } = getFileMeta(file, "")
    return String(name).toLocaleLowerCase().includes(normalizedSearch)
  })

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const selectUploadFile = (files) => {
    const selectedFiles = Array.from(files || [])
    if (selectedFiles.length === 0) return
    if (selectedFiles.length > 1) {
      toast.error(cm.toastSingleFile || cd.toastSingleFile || "Please select one material at a time.")
      return
    }

    const file = selectedFiles[0]
    const validationError = validateMaterialFile(file)
    if (validationError === "size") {
      toast.error(cm.toastFileTooLarge || cd.toastFileTooLarge || "The file must be 15MB or smaller.")
      return
    }
    if (validationError === "type") {
      toast.error(cm.toastInvalidFileType || cd.toastInvalidFileType || "Use a PDF, DOCX, XLSX, or image file.")
      return
    }
    if (validationError) {
      toast.error(cm.toastInvalidFile || cd.toastInvalidFile || "Please select a non-empty file.")
      return
    }

    setSelectedUploadFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    selectUploadFile(e.dataTransfer.files)
  }

  const handleFileSelect = (e) => {
    selectUploadFile(e.target.files)
    e.target.value = ""
  }

  const handleUploadSubmit = async () => {
    if (
      !id
      || !selectedUploadFile
      || isUploading
      || uploadInFlightRef.current
    ) {
      return
    }

    const validationError = validateMaterialFile(selectedUploadFile)
    if (validationError) {
      selectUploadFile([selectedUploadFile])
      return
    }

    uploadInFlightRef.current = true
    try {
      await uploadMaterial({ classId: id, file: selectedUploadFile }).unwrap()
      setSelectedUploadFile(null)
      toast.success(cm.toastUploadSuccess || cd.toastUploadSuccess || "Material uploaded successfully!")
    } catch {
      toast.error(cm.toastUploadFailed || cd.toastUploadFailed || "Failed to upload material!")
    } finally {
      uploadInFlightRef.current = false
    }
  }

  const handleDeleteMaterial = async () => {
    if (
      !id
      || !deleteMaterialData?.id
      || deleteInFlightRef.current
    ) {
      return
    }
    deleteInFlightRef.current = true
    try {
      await deleteMaterial({
        classId: id,
        materialId: deleteMaterialData.id,
      }).unwrap()
      toast.success(cm.toastDeleteSuccess || cd.toastDeleteSuccess || "Material deleted successfully!")
    } catch {
      toast.error(cm.toastDeleteFailed || cd.toastDeleteFailed || "Failed to delete material!")
    } finally {
      deleteInFlightRef.current = false
      setDeleteMaterialData(null)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* LEFT/MAIN COLUMN: Materials List (Full width for student) */}
      <div className={`${isStudent ? "lg:col-span-3" : "lg:col-span-2"} flex flex-col gap-4`}>
        {/* Header and Search */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#990011] rounded-full" />
            <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
              {cm.materialsList || cd.materialsList || "Materials List"}
            </h3>
          </div>

          {!isStudent && <div className="relative w-full sm:w-64">
            <input
              type="text"
              aria-label={cm.searchMaterialsLabel || cd.searchMaterials || "Search materials"}
              placeholder={cm.searchMaterials || cd.searchMaterials || "Search materials..."}
              value={materialSearch}
              onChange={(e) => setMaterialSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-xs font-semibold text-gray-800 transition-all placeholder:text-gray-400"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>}
        </div>

        {/* List of files */}
        <div
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-3 min-h-[300px]"
          aria-busy={isMaterialsLoading || isMaterialsFetching}
        >
          {isStudent ? (
            <div
              role="status"
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                <FileText size={24} />
              </div>
              <h4 className="text-sm font-bold text-gray-800 mb-1">
                {cm.materialsUnavailable || "Student materials are not available yet"}
              </h4>
              <p className="text-xs font-semibold text-gray-400 max-w-[320px]">
                {cm.materialsUnavailableDescription || "Materials will appear here when they become available."}
              </p>
            </div>
          ) : (
            <>
              {hasMalformedItems && (
                <div
                  role="alert"
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800"
                >
                  {cm.someMaterialsUnavailable || "Some materials could not be displayed."}
                </div>
              )}
              {isMaterialsLoading ? (
                <div
                  role="status"
                  className="flex flex-col items-center justify-center py-20 gap-3"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#990011]" />
                  <span className="text-xs font-bold text-gray-400">
                    {cm.loadingMaterials || cd.loadingMaterials || "Loading materials..."}
                  </span>
                </div>
              ) : !id || isMaterialsError || hasMalformedResponse ? (
                <div
                  role="alert"
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-[#990011] mb-4 border border-red-100">
                    <FileText size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1">
                    {cm.materialsLoadFailed || "Unable to load materials"}
                  </h4>
                  <p className="text-xs font-semibold text-gray-400 max-w-[280px]">
                    {cm.materialsLoadRetry || "Please check your connection and try again."}
                  </p>
                  {id && (
                    <button
                      type="button"
                      onClick={() => refetchMaterials()}
                      className="mt-4 rounded-xl border border-[#990011] px-4 py-2 text-xs font-extrabold text-[#990011] hover:bg-red-50"
                    >
                      {cm.retry || "Try again"}
                    </button>
                  )}
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                    <FileText size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1">
                    {normalizedSearch && materialsList.length > 0
                      ? (cm.noMatchingMaterials || "No matching materials")
                      : (cm.noMaterials || cd.noMaterials || "No materials yet")}
                  </h4>
                  <p className="text-xs font-semibold text-gray-400 max-w-[280px]">
                    {normalizedSearch && materialsList.length > 0
                      ? (cm.tryAnotherMaterialSearch || "Try a different search term.")
                      : (cm.startUploading || cd.startUploading || "Upload a material to get started.")}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-gray-100">
                  {filteredMaterials.map((file, index) => {
                    const {
                      name: rawFileName,
                      url: fileUrl,
                      size: fileSize,
                    } = getFileMeta(file, cm.unnamedFile)
                    const fileName = (
                      typeof rawFileName === "string" && rawFileName.trim()
                        ? rawFileName
                        : (cm.unnamedFile || "Unnamed file")
                    )
                    const material = isRecord(file) ? file : {}
                    const materialId = ["string", "number"].includes(typeof material.id)
                      ? material.id
                      : null
                    const safeFileUrl = getSafeFileUrl(fileUrl)
                    const fileDate = material.createdAt || material.uploadedAt
                    const formattedFileDate = formatMaterialDate(fileDate, dateLocale)
                    const itemKey = materialId ?? `${fileName}-${index}`

                    return (
                      <div key={itemKey} className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0 hover:bg-gray-50/30 px-2 rounded-xl transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          {getFileIcon(fileName)}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-gray-800 break-all max-w-[200px] md:max-w-md">
                              {fileName}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold mt-1">
                              <span>{formatMaterialSize(fileSize)}</span>
                              {formattedFileDate && (
                                <>
                                  <span>•</span>
                                  <span>{formattedFileDate}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {safeFileUrl && (
                            <a
                              href={safeFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              referrerPolicy="no-referrer"
                              aria-label={`${cm.viewFile || "View file"}: ${fileName}`}
                              className="p-2 text-gray-400 hover:text-[#990011] hover:bg-[#990011]/5 rounded-xl transition-all"
                              title={cm.viewFile || "View file"}
                            >
                              <Eye size={15} />
                            </a>
                          )}
                          {fileUrl && !safeFileUrl && (
                            <span
                              aria-label={`${fileName}: ${cm.fileUnavailable || "File unavailable"}`}
                              className="p-2 text-gray-300 cursor-not-allowed"
                              title={cm.fileUnavailable || "File unavailable"}
                            >
                              <Eye size={15} />
                            </span>
                          )}
                          {!isStudent && materialId != null && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteMaterialData(material)
                              }}
                              aria-label={`${cm.deleteFile || "Delete file"}: ${fileName}`}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-55 rounded-xl transition-all"
                              title={cm.deleteFile || "Delete file"}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Upload Panel (Hidden for students) */}
      {!isStudent && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-2.5">
              <span className="w-1.5 h-4 bg-[#990011] rounded-full" />
              <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
                {cm.uploadMaterial || cd.uploadMaterial || "Upload Material"}
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              <div
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${dragActive
                  ? "border-[#990011] bg-[#990011]/5"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/55"
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={cm.selectFileLabel || "Select a material file"}
                aria-describedby="material-upload-limits"
              >
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#990011] mb-3">
                  <Upload size={18} />
                </div>
                <span className="text-xs font-bold text-gray-800">
                  {cm.selectFile || cd.selectFile || "Select a file or drag and drop"}
                </span>
                <span
                  id="material-upload-limits"
                  className="text-[10px] text-gray-400 font-semibold mt-1"
                >
                  {cm.supportedFiles || "Supports PDF, DOCX, XLSX, and images (max 15 MB)"}
                </span>
              </div>
              <input
                ref={fileInputRef}
                id="file-upload-input"
                type="file"
                accept=".pdf,.docx,.xlsx,.bmp,.gif,.heic,.avif,.jpeg,.jpg,.png,.tif,.tiff,.webp"
                className="hidden"
                onChange={handleFileSelect}
              />

              {selectedUploadFile && (
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {getFileIcon(selectedUploadFile.name)}
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-bold text-gray-850 truncate max-w-[150px]">
                        {selectedUploadFile.name}
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold">
                        {formatFileSize(selectedUploadFile.size)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUploadFile(null)}
                    aria-label={cm.removeSelectedFile || "Remove selected file"}
                    className="p-1 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <button
                type="button"
                disabled={!id || !selectedUploadFile || isUploading}
                onClick={handleUploadSubmit}
                className="w-full h-10 bg-[#990011] hover:bg-[#80000e] disabled:bg-gray-200 text-white disabled:text-gray-400 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <Upload size={13} />
                    <span>{cm.uploadNow || "Upload Now"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for deleting material */}
      <ConfirmationModal
        open={!!deleteMaterialData}
        onClose={() => {
          if (!deleteInFlightRef.current) setDeleteMaterialData(null)
        }}
        onConfirm={handleDeleteMaterial}
        title={cm.deleteMaterial || "Delete Material"}
        message={cm.confirmDeleteMaterial || cd.confirmDeleteMaterial || "Are you sure you want to delete this material?"}
        confirmText={cm.delete || "Delete"}
        cancelText={cancelText || cm.cancel || "Cancel"}
      />
    </div>
  )
}

export default ClassMaterialsTab
