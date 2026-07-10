import React, { useRef, useState } from "react"
import { Search, FileText, Download, Trash2, Upload, X } from "lucide-react"
import { useGetClassMaterialsQuery, useUploadClassMaterialMutation, useDeleteClassMaterialMutation } from "@/store/api/coursesApi"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { toast } from "react-hot-toast"
import { formatFileSize, getFileIconColorClass } from "../../utils/courseUtils"

const ClassMaterialsTab = ({ id, isStudent, cd, cancelText }) => {
  const fileInputRef = useRef(null)

  const getFileIcon = (fileName) => {
    const colorClass = getFileIconColorClass(fileName)
    return <FileText className={colorClass} size={18} />
  }
  const { data: materialsResponse, isLoading: isMaterialsLoading } = useGetClassMaterialsQuery(id)
  const [uploadMaterial, { isLoading: isUploading }] = useUploadClassMaterialMutation()
  const [deleteMaterial] = useDeleteClassMaterialMutation()

  const [materialSearch, setMaterialSearch] = useState("")
  const [selectedUploadFile, setSelectedUploadFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [deleteMaterialData, setDeleteMaterialData] = useState(null)

  const materialsList = materialsResponse?.data || materialsResponse || []
  const filteredMaterials = materialsList.filter(file => {
    const name = file.name || file.fileName || ""
    return name.toLowerCase().includes(materialSearch.toLowerCase())
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

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedUploadFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedUploadFile(e.target.files[0])
    }
  }

  const handleUploadSubmit = async () => {
    if (!selectedUploadFile) return
    try {
      await uploadMaterial({ classId: id, file: selectedUploadFile }).unwrap()
      setSelectedUploadFile(null)
      toast.success(cd.toastUploadSuccess || "Material uploaded successfully!")
    } catch {
      toast.error(cd.toastUploadFailed || "Failed to upload material!")
    }
  }

  const handleDeleteMaterial = async () => {
    if (!deleteMaterialData) return
    try {
      await deleteMaterial({ classId: id, materialId: deleteMaterialData.id }).unwrap()
      toast.success(cd.toastDeleteSuccess || "Material deleted successfully!")
    } catch {
      toast.error(cd.toastDeleteFailed || "Failed to delete material!")
    } finally {
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
              {cd.materialsList || "Danh sách tài liệu"}
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={cd.searchMaterials || "Tìm tài liệu..."}
              value={materialSearch}
              onChange={(e) => setMaterialSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-transparent focus:border-gray-200 outline-none rounded-xl text-xs font-semibold text-gray-800 transition-all placeholder:text-gray-400"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* List of files */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-3 min-h-[300px]">
          {isMaterialsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#990011]" />
              <span className="text-xs font-bold text-gray-400">
                {cd.loadingMaterials || "Đang tải..."}
              </span>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                <FileText size={24} />
              </div>
              <h4 className="text-sm font-bold text-gray-800 mb-1">
                {cd.noMaterials || "Chưa có tài liệu"}
              </h4>
              <p className="text-xs font-semibold text-gray-400 max-w-[280px]">
                {cd.startUploading || "Tải tài liệu lên ngay!"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100">
              {filteredMaterials.map((file) => {
                const fileName = file.name || file.fileName || "Unnamed file"
                const fileUrl = file.url || file.fileUrl || ""
                const fileSize = file.size || file.fileSize || 0
                const fileDate = file.createdAt || file.uploadedAt || ""

                return (
                  <div key={file.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 hover:bg-gray-50/30 px-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      {getFileIcon(fileName)}
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800 break-all max-w-[200px] md:max-w-md">
                          {fileName}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold mt-1">
                          <span>{formatFileSize(fileSize)}</span>
                          <span>•</span>
                          <span>{fileDate ? new Date(fileDate).toLocaleDateString("en-GB", { timeZone: "UTC" }) : ""}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {fileUrl && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-gray-400 hover:text-[#990011] hover:bg-[#990011]/5 rounded-xl transition-all"
                          title="Download File"
                        >
                          <Download size={15} />
                        </a>
                      )}
                      {!isStudent && (
                        <button
                          onClick={() => {
                            setDeleteMaterialData(file)
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-55 rounded-xl transition-all"
                          title="Delete File"
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
        </div>
      </div>

      {/* RIGHT COLUMN: Upload Panel (Hidden for students) */}
      {!isStudent && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-2.5">
              <span className="w-1.5 h-4 bg-[#990011] rounded-full" />
              <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
                {cd.uploadMaterial || "Tải lên tài liệu"}
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
              >
                <input
                  ref={fileInputRef}
                  id="file-upload-input"
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#990011] mb-3">
                  <Upload size={18} />
                </div>
                <span className="text-xs font-bold text-gray-800">
                  {cd.selectFile || "Chọn tệp tin hoặc kéo thả"}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold mt-1">
                  Support PDF, DOCX, XLSX, images (Max 15MB)
                </span>
              </div>

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
                    onClick={() => setSelectedUploadFile(null)}
                    className="p-1 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <button
                type="button"
                disabled={!selectedUploadFile || isUploading}
                onClick={handleUploadSubmit}
                className="w-full h-10 bg-[#990011] hover:bg-[#80000e] disabled:bg-gray-200 text-white disabled:text-gray-400 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <Upload size={13} />
                    <span>{cd.uploadNow || "Tải lên ngay"}</span>
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
        onClose={() => setDeleteMaterialData(null)}
        onConfirm={handleDeleteMaterial}
        title="Delete Material"
        message={cd.confirmDeleteMaterial || "Bạn có chắc chắn muốn xóa tài liệu này?"}
        confirmText="Delete"
        cancelText={cancelText || "Hủy"}
      />
    </div>
  )
}

export default ClassMaterialsTab
