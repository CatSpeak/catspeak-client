import { describe, expect, it } from "vitest"
import {
  SAFE_RASTER_IMAGE_EXTENSIONS,
  SAFE_RASTER_IMAGE_MIME_TYPES,
  validateUploadFile,
} from "./fileValidation"

describe("validateUploadFile", () => {
  it("rejects dangerous active file types such as svg, html, and exe", () => {
    const svg = new File(["<svg/>"], "avatar.svg", { type: "image/svg+xml" })
    const html = new File(["<html/>"], "payload.html", { type: "text/html" })
    const exe = new File(["MZ"], "runner.exe", {
      type: "application/x-msdownload",
    })

    expect(validateUploadFile(svg).valid).toBe(false)
    expect(validateUploadFile(html).valid).toBe(false)
    expect(validateUploadFile(exe).valid).toBe(false)
  })

  it("rejects empty files and files exceeding maxBytes", () => {
    const empty = new File([], "empty.png", { type: "image/png" })
    const big = new File([new Uint8Array(2048)], "large.png", {
      type: "image/png",
    })

    expect(validateUploadFile(empty)).toEqual({
      valid: false,
      reason: "empty",
    })
    expect(validateUploadFile(big, { maxBytes: 1024 })).toEqual({
      valid: false,
      reason: "size",
    })
  })

  it("accepts valid raster images when allowlisted", () => {
    const png = new File(["pngbytes"], "cover.png", { type: "image/png" })
    const result = validateUploadFile(png, {
      allowedExtensions: SAFE_RASTER_IMAGE_EXTENSIONS,
      allowedMimeTypes: SAFE_RASTER_IMAGE_MIME_TYPES,
      maxBytes: 1024 * 1024,
    })

    expect(result).toEqual({ valid: true, extension: "png" })
  })
})
