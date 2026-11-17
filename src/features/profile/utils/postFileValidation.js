export const MAX_POST_FILES = 5
export const MAX_POST_FILE_SIZE_MB = 50
export const MAX_POST_FILE_SIZE_BYTES = MAX_POST_FILE_SIZE_MB * 1024 * 1024

export const ALLOWED_POST_FILE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".mp4",
  ".mov",
  ".webm",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".zip",
  ".rar",
]

export const ALLOWED_EXTENSIONS_STRING = ALLOWED_POST_FILE_EXTENSIONS.join(", ")

export const getFileExtension = (fileName = "") => {
  const lastDot = fileName.lastIndexOf(".")
  if (lastDot === -1 || lastDot === 0) return ""
  return fileName.slice(lastDot).toLowerCase()
}

/**
 * Validate incoming files for post creation/editing.
 * @param {File[]|FileList} incomingFiles
 * @param {number} currentFilesCount - Number of files/media already attached
 * @param {object} t - Translation dictionary from useLanguage()
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validatePostFiles = (
  incomingFiles = [],
  currentFilesCount = 0,
  t = null,
) => {
  const filesArray = Array.from(incomingFiles)
  const totalCount = currentFilesCount + filesArray.length

  if (totalCount > MAX_POST_FILES) {
    const template =
      t?.profile?.post?.editor?.fileCountLimit ||
      "Tối đa {max} tệp đính kèm cho mỗi bài viết."
    return {
      isValid: false,
      error: template.replace("{max}", MAX_POST_FILES),
    }
  }

  for (const file of filesArray) {
    const ext = getFileExtension(file.name)
    if (!ext || !ALLOWED_POST_FILE_EXTENSIONS.includes(ext)) {
      const template =
        t?.profile?.post?.editor?.fileTypeNotAllowed ||
        "Định dạng tệp '{fileName}' không được hỗ trợ. Các định dạng được phép: {allowed}."
      return {
        isValid: false,
        error: template
          .replace("{fileName}", file.name)
          .replace("{allowed}", ALLOWED_EXTENSIONS_STRING),
      }
    }

    if (file.size > MAX_POST_FILE_SIZE_BYTES) {
      const template =
        t?.profile?.post?.editor?.fileSizeLimit ||
        "Tệp '{fileName}' vượt quá dung lượng tối đa {maxSize}MB."
      return {
        isValid: false,
        error: template
          .replace("{fileName}", file.name)
          .replace("{maxSize}", MAX_POST_FILE_SIZE_MB),
      }
    }
  }

  return { isValid: true }
}
