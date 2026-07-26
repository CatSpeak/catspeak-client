import React, { useRef, useState } from "react"
import { Editor } from "@tinymce/tinymce-react"
import { SendHorizonal } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import { IconButton } from "@/shared/components/ui/buttons"

/**
 * Phần nhập bình luận sử dụng TinyMCE rich-text editor.
 *
 * @param {string}   [currentUserAvatar] - URL avatar người dùng hiện tại
 * @param {string}   [currentUserName]   - Tên người dùng hiện tại
 * @param {string}   [placeholder]       - Placeholder cho editor
 * @param {function} [onSubmit]          - Callback(htmlContent) khi gửi bình luận
 */
const CommentInput = ({
  currentUserAvatar,
  currentUserName,
  placeholder = "Nhập phản hồi",
  onSubmit,
}) => {
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
    <div className="flex items-start gap-4">
      {/* Current user avatar */}
      <div className="shrink-0 pt-1">
        <Avatar
          src={currentUserAvatar}
          name={currentUserName}
          alt={currentUserName || "Bạn"}
          size={40}
        />
      </div>

      {/* Editor + Send */}
      <div className="flex-1 flex items-end gap-2">
        <div className="flex-1 rounded-xl overflow-hidden border border-[#E2E2E2] bg-[#F3F4F5] focus-within:border-[#750000] transition-colors">
          <Editor
            tinymceScriptSrc="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.3/tinymce.min.js"
            value={value}
            onInit={(_evt, editor) => { editorRef.current = editor }}
            onEditorChange={handleEditorChange}
            init={{
              height: 160,
              menubar: false,
              statusbar: false,
              plugins: ["autolink", "lists", "link", "image"],
              toolbar:
                "bold italic underline | bullist numlist | link image",
              placeholder,
              skin: "oxide",
              setup: (editor) => {
                editor.on("keydown", (e) => {
                  // Ctrl+Enter hoặc Cmd+Enter để gửi
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault()
                    handleSubmit()
                  }
                })
              },
            }}
          />
        </div>

        {/* Send button */}
        <IconButton
          variant="primary"
          size="xs"
          onClick={handleSubmit}
          disabled={!hasContent}
          title="Gửi (Ctrl+Enter)"
        >
          <SendHorizonal size={15} />
        </IconButton>
      </div>
    </div>
  )
}

export default CommentInput

