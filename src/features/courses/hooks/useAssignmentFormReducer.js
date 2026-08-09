import { useReducer, useCallback, useRef } from "react"

const MAX_ASSIGNMENT_ATTACHMENTS = 5

function getAttachmentValidationError(file) {
  if (!file || typeof file.name !== "string") return "invalid"

  const size = Number(file.size)
  if (!Number.isFinite(size) || size <= 0) return "empty"
  if (size > 50 * 1024 * 1024) return "size"

  const name = String(file.name || "")
  const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : ""
  const allowed = ["pdf", "docx", "xlsx", "pptx", "jpg", "png"]
  if (!allowed.includes(ext)) return "type"

  return null
}

function getAttachmentFingerprint(file) {
  const fileObj = file?.file || file
  return `${String(fileObj?.name || "").toLowerCase()}-${Number(fileObj?.size) || 0}-${Number(fileObj?.lastModified) || 0}`
}

function createInitialState(defaults) {
  return {
    editorText: defaults?.editorText || "",
    title: defaults?.title || "",
    dueDate: defaults?.dueDate || "",
    dueTime: defaults?.dueTime || "23:59",
    allowLateSubmission: defaults?.allowLateSubmission ?? true,
    attachedFiles: [],
    existingAttachments: defaults?.existingAttachments || [],
    submissionTypeFile: defaults?.submissionTypeFile ?? true,
    submissionTypeText: defaults?.submissionTypeText ?? false,
    allowedFileTypes: defaults?.allowedFileTypes || [],
    maxFiles: defaults?.maxFiles || 1,
    enableGrading: defaults?.enableGrading ?? false,
    gradeScale: defaults?.gradeScale || "scale10",
    resultRelease: defaults?.resultRelease || "manual",
    publishStatus: defaults?.publishStatus || "now",
    postToFeed: defaults?.postToFeed ?? true,
  }
}

function assignmentFormReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value }

    case "TOGGLE_FIELD":
      return { ...state, [action.field]: !state[action.field] }

    case "ADD_ATTACHED_FILES":
      return {
        ...state,
        attachedFiles: [...state.attachedFiles, ...action.files],
      }

    case "REMOVE_ATTACHED_FILE":
      return {
        ...state,
        attachedFiles: state.attachedFiles.filter((f) => f.id !== action.fileId),
      }

    case "REMOVE_EXISTING_ATTACHMENT":
      return {
        ...state,
        existingAttachments: state.existingAttachments.filter((_, idx) => idx !== action.index),
      }

    case "REMOVE_FILE_TYPE":
      return {
        ...state,
        allowedFileTypes: state.allowedFileTypes.filter((t) => t !== action.fileType),
      }

    case "ADD_FILE_TYPE":
      if (action.fileType === "all" || state.allowedFileTypes.includes(action.fileType)) {
        return state
      }
      return {
        ...state,
        allowedFileTypes: [...state.allowedFileTypes, action.fileType],
      }

    default:
      return state
  }
}

export function useAssignmentFormReducer(defaults, { toast }) {
  const [state, dispatch] = useReducer(
    assignmentFormReducer,
    defaults,
    createInitialState
  )

  const fileInputRef = useRef(null)

  const setField = useCallback((field, value) => {
    dispatch({ type: "SET_FIELD", field, value })
  }, [])

  const toggleField = useCallback((field) => {
    dispatch({ type: "TOGGLE_FIELD", field })
  }, [])

  const removeExistingAttachment = useCallback((index) => {
    dispatch({ type: "REMOVE_EXISTING_ATTACHMENT", index })
  }, [])

  const removeFileType = useCallback((fileType) => {
    dispatch({ type: "REMOVE_FILE_TYPE", fileType })
  }, [])

  const addFileType = useCallback((fileType) => {
    dispatch({ type: "ADD_FILE_TYPE", fileType })
  }, [])

  const addFiles = useCallback(
    (filesList, ca = {}) => {
      const files = Array.from(filesList || [])
      if (files.length === 0) return

      const availableSlots =
        MAX_ASSIGNMENT_ATTACHMENTS -
        state.existingAttachments.length -
        state.attachedFiles.length

      if (files.length > availableSlots) {
        toast.error(ca.toastMaxFiles || "Tối đa 5 tài liệu đính kèm")
        return
      }

      const validationError = files
        .map(getAttachmentValidationError)
        .find(Boolean)
      if (validationError === "size") {
        toast.error(ca.toastFileTooLarge || "Each file must be 50 MB or smaller")
        return
      }
      if (validationError === "type") {
        toast.error(ca.toastInvalidFileType || "This file type is not supported")
        return
      }
      if (validationError) {
        toast.error(ca.toastInvalidFile || "Please select a non-empty file")
        return
      }

      const fingerprints = new Set(
        state.attachedFiles.map(getAttachmentFingerprint)
      )
      if (
        files.some((file) => fingerprints.has(getAttachmentFingerprint(file)))
      ) {
        toast.error(ca.toastDuplicateFile || "This file is already attached")
        return
      }

      const selectionFingerprints = new Set()
      if (
        files.some((file) => {
          const fingerprint = getAttachmentFingerprint(file)
          if (selectionFingerprints.has(fingerprint)) return true
          selectionFingerprints.add(fingerprint)
          return false
        })
      ) {
        toast.error(ca.toastDuplicateFile || "This file is already attached")
        return
      }

      const newFiles = files.map((file, idx) => {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(1)
        return {
          id: `uploaded-file-${Date.now()}-${idx}`,
          name: file.name,
          size: `${sizeInMB} MB`,
          file,
        }
      })

      dispatch({ type: "ADD_ATTACHED_FILES", files: newFiles })
      toast.success(ca.toastUploadSuccess || "Đã đính kèm tài liệu thành công")
    },
    [state.existingAttachments.length, state.attachedFiles, toast]
  )

  const removeFile = useCallback(
    (fileId, ca = {}) => {
      dispatch({ type: "REMOVE_ATTACHED_FILE", fileId })
      toast.success(ca.toastDeleteSuccess || "Đã xóa tài liệu đính kèm")
    },
    [toast]
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(
    (e, ca) => {
      e.preventDefault()
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files, ca)
      }
    },
    [addFiles]
  )

  const handleFileSelect = useCallback(
    (e, ca) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files, ca)
      }
      e.target.value = ""
    },
    [addFiles]
  )

  return {
    state,
    dispatch,
    fileInputRef,

    // Actions
    setField,
    toggleField,
    addFiles,
    removeFile,
    removeExistingAttachment,
    removeFileType,
    addFileType,

    // Event Handlers
    handleDragOver,
    handleDrop,
    handleFileSelect,
  }
}
