import assert from "node:assert"
import {
  MAX_POST_FILES,
  MAX_POST_FILE_SIZE_BYTES,
  MAX_POST_FILE_SIZE_MB,
  ALLOWED_POST_FILE_EXTENSIONS,
  ALLOWED_EXTENSIONS_STRING,
  getFileExtension,
  validatePostFiles,
} from "./postFileValidation.js"

// Test 1: getFileExtension
assert.strictEqual(getFileExtension("photo.jpg"), ".jpg")
assert.strictEqual(getFileExtension("PHOTO.PNG"), ".png")
assert.strictEqual(getFileExtension("archive.tar.gz"), ".gz")
assert.strictEqual(getFileExtension("video.mp4"), ".mp4")
assert.strictEqual(getFileExtension("no_extension"), "")
assert.strictEqual(getFileExtension(".gitignore"), "")
assert.strictEqual(getFileExtension(""), "")

// Test 2: Allowed extensions count
assert.strictEqual(ALLOWED_POST_FILE_EXTENSIONS.length, 17)
assert.strictEqual(ALLOWED_POST_FILE_EXTENSIONS.includes(".webp"), false)
assert.strictEqual(ALLOWED_POST_FILE_EXTENSIONS.includes(".jpg"), true)
assert.strictEqual(ALLOWED_POST_FILE_EXTENSIONS.includes(".docx"), true)

// Test 3: validatePostFiles - valid files
const validFiles = [
  { name: "test.png", size: 1024 * 1024 },
  { name: "doc.pdf", size: 2 * 1024 * 1024 },
]
const validResult = validatePostFiles(validFiles, 0)
assert.strictEqual(validResult.isValid, true)
assert.strictEqual(validResult.error, undefined)

// Test 4: validatePostFiles - file count limit exceeded
const tooManyFiles = [
  { name: "1.png", size: 10 },
  { name: "2.png", size: 10 },
  { name: "3.png", size: 10 },
  { name: "4.png", size: 10 },
  { name: "5.png", size: 10 },
  { name: "6.png", size: 10 },
]
const countResult = validatePostFiles(tooManyFiles, 0)
assert.strictEqual(countResult.isValid, false)
assert.ok(countResult.error.includes("5"))

// Also count limit with existing media
const countWithExisting = validatePostFiles([{ name: "1.png", size: 10 }], 5)
assert.strictEqual(countWithExisting.isValid, false)

// Test 5: validatePostFiles - disallowed extension (.webp)
const webpFile = [{ name: "S1e19_bill_snap.webp", size: 1024 }]
const webpResultVi = validatePostFiles(webpFile, 0)
assert.strictEqual(webpResultVi.isValid, false)
assert.ok(webpResultVi.error.includes("S1e19_bill_snap.webp"))

// Disallowed extension with English t
const mockEnT = {
  profile: {
    post: {
      editor: {
        fileTypeNotAllowed:
          "File extension of '{fileName}' is not allowed. Allowed extensions are: {allowed}.",
      },
    },
  },
}
const webpResultEn = validatePostFiles(webpFile, 0, mockEnT)
assert.strictEqual(webpResultEn.isValid, false)
assert.strictEqual(
  webpResultEn.error,
  `File extension of 'S1e19_bill_snap.webp' is not allowed. Allowed extensions are: ${ALLOWED_EXTENSIONS_STRING}.`,
)

// Test 6: validatePostFiles - file size exceeds 50MB
const oversizedFile = [
  { name: "large_video.mp4", size: 50 * 1024 * 1024 + 1 },
]
const sizeResult = validatePostFiles(oversizedFile, 0)
assert.strictEqual(sizeResult.isValid, false)
assert.ok(sizeResult.error.includes("large_video.mp4"))
assert.ok(sizeResult.error.includes("50MB"))

// Oversized with Japanese t
const mockJaT = {
  profile: {
    post: {
      editor: {
        fileSizeLimit:
          "ファイル '{fileName}' が最大サイズ{maxSize}MBを超えています。",
      },
    },
  },
}
const sizeResultJa = validatePostFiles(oversizedFile, 0, mockJaT)
assert.strictEqual(sizeResultJa.isValid, false)
assert.strictEqual(
  sizeResultJa.error,
  "ファイル 'large_video.mp4' が最大サイズ50MBを超えています。",
)

console.log("All postFileValidation tests passed successfully!")
