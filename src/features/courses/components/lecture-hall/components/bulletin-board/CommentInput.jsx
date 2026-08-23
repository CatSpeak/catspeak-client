import React, { useRef, useState } from "react"
import { Editor } from "@tinymce/tinymce-react"
import { SendHorizonal, X } from "lucide-react"
import { PillButton } from "@/shared/components/ui/buttons"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Phần nhập bình luận sử dụng TinyMCE rich-text editor.
 *
 * @param {string}   [currentUserAvatar] - URL avatar người dùng hiện tại
 * @param {string}   [currentUserName]   - Tên người dùng hiện tại
 * @param {string}   [placeholder]       - Placeholder cho editor
 * @param {function} [onSubmit]          - Callback(htmlContent) khi gửi bình luận
 */
const CommentInput = ({ onSubmit }) => {
  const { t } = useLanguage()
  const dict = t.courses.lectureHall.postDetail

  const [value, setValue] = useState("")
  const editorRef = useRef(null)

  const handleEditorChange = (newContent) => {
    setValue(newContent)
  }

  const handleSubmit = () => {
    // Strip HTML tags to check if there's actual text content
    const textOnly = value.replace(/<[^>]*>/g, "").trim()
    if (!textOnly) return
    onSubmit && onSubmit(value)
    setValue("")
    // Reset editor content
    if (editorRef.current) {
      editorRef.current.setContent("")
    }
  }

  const hasContent = value.replace(/<[^>]*>/g, "").trim().length > 0

  return (
    <div className="flex-1 relative">
      <div className="rounded-2xl overflow-hidden border border-[#E2E2E2] bg-white focus-within:border-[#750000] transition-colors shadow-sm">
        <style>{`
          .tox-tinymce {
            border: none !important;
            border-radius: 16px !important;
            background-color: white !important;
          }
          .tox-edit-area {
            background-color: #F8F9FA !important;
          }
          .tox .tox-editor-header {
            border-top: 1px solid #E2E2E2 !important;
            box-shadow: none !important;
            padding: 8px 16px !important;
            background-color: white !important;
          }
        `}</style>
        <Editor
          tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"
          value={value}
          onInit={(_evt, editor) => { editorRef.current = editor }}
          onEditorChange={handleEditorChange}
          init={{
            min_height: 140,
            menubar: false,
            statusbar: false,
            plugins: ["autolink", "lists", "link", "image", "autoresize"],
            toolbar:
              "bold italic underline | bullist numlist | link image",
            toolbar_location: "bottom",
            placeholder: dict.inputPlaceholder || "Nhập phản hồi",
            skin: "oxide",
            autoresize_bottom_margin: 0,
            setup: (editor) => {
              editor.on("keydown", (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              })
            },
            content_style:
              "body { font-family:Inter,sans-serif; font-size:15px; color:#191C1D; background-color:transparent; padding:16px 20px !important; margin:0 !important; display:block; } p { margin: 0; line-height: 1.5; } .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before { left: 20px !important; top: 16px !important; }",
          }}
        />
        {/* Send Button */}
        <div className="absolute bottom-[6px] right-3 z-10">
          <button
            onClick={handleSubmit}
            disabled={!hasContent}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              hasContent
                ? "bg-[#990011] text-white hover:bg-[#80000e]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <SendHorizonal size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommentInput
