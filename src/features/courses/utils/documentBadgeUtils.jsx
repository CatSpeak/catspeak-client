import React from "react"

export const getDocumentColorConfig = (extName) => {
  const ext = String(extName || "").toUpperCase()
  switch (ext) {
    case "PDF":
      return {
        primary: "#E02424", // PDF Red
        secondary: "#990011",
        banner: "#C81E1E",
      }
    case "XLSX":
    case "XLS":
    case "CSV":
      return {
        primary: "#107C41", // Excel Green
        secondary: "#0A4E29",
        banner: "#0D6334",
      }
    case "DOC":
    case "DOCX":
      return {
        primary: "#185ABD", // Word Blue
        secondary: "#103C7E",
        banner: "#144B9C",
      }
    case "PPT":
    case "PPTX":
      return {
        primary: "#D24726", // PowerPoint Orange
        secondary: "#8C2F19",
        banner: "#AB3A1F",
      }
    case "PNG":
    case "JPG":
    case "JPEG":
    case "WEBP":
    case "GIF":
    case "SVG":
      return {
        primary: "#7C3AED", // Image Purple
        secondary: "#5B21B6",
        banner: "#6D28D9",
      }
    case "ZIP":
    case "RAR":
    case "7Z":
    case "TAR":
      return {
        primary: "#D97706", // Archive Amber
        secondary: "#92400E",
        banner: "#B45309",
      }
    case "MP4":
    case "MP3":
    case "WAV":
    case "MOV":
      return {
        primary: "#0D9488", // Media Teal
        secondary: "#0F766E",
        banner: "#115E59",
      }
    default:
      return {
        primary: "#64748B", // Slate
        secondary: "#334155",
        banner: "#475569",
      }
  }
}

export const getFileExtension = (fileName) => {
  if (!fileName || typeof fileName !== "string") return "PDF"
  const dotIndex = fileName.lastIndexOf(".")
  if (dotIndex < 0) return "FILE"
  return fileName.slice(dotIndex + 1).toUpperCase()
}

export const DocumentTypeBadge = ({ extension = "PDF", className = "w-8 h-10" }) => {
  const ext = (extension || "FILE").toUpperCase()
  const { primary, secondary, banner } = getDocumentColorConfig(ext)
  const isShort = ext.length <= 3

  return (
    <svg
      viewBox="0 0 36 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 drop-shadow-2xs`}
      aria-label={ext}
    >
      {/* Main Document Body with folded corner */}
      <path
        d="M 5 2 
           H 23 
           L 33 12 
           V 39 
           C 33 41.2 31.2 43 29 43 
           H 5 
           C 2.8 43 1 41.2 1 39 
           V 6 
           C 1 3.8 2.8 2 5 2 Z"
        fill={primary}
      />

      {/* Folded Top-Right Flap */}
      <path
        d="M 23 2 
           L 33 12 
           H 25 
           C 23.9 12 23 11.1 23 10 
           Z"
        fill={secondary}
      />
      <path
        d="M 23 2 
           L 33 12 
           H 23 
           Z"
        fill="#FFFFFF"
        fillOpacity="0.25"
      />

      {/* Ribbon / Banner across center */}
      <rect
        x="0"
        y="18"
        width="30"
        height="14"
        rx="2.5"
        fill={banner}
      />

      {/* Extension Label */}
      <text
        x="15"
        y="28.5"
        fill="#FFFFFF"
        fontSize={isShort ? "8.5" : "7"}
        fontWeight="800"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        letterSpacing="0.2px"
      >
        {ext}
      </text>
    </svg>
  )
}
