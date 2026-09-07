import DOMPurify from "dompurify"

/**
 * Dựng markdown của câu trả lời chatbot thành HTML.
 *
 * KHÔNG dùng thư viện markdown đầy đủ, vì tập cú pháp cần dựng ở đây rất hẹp và
 * biết trước: prompt ở `read/rag/generation.py` bảo mô hình trả lời NGẮN GỌN, và
 * thực tế nó chỉ dùng đậm, nghiêng, mã ngắn, gạch đầu dòng, danh sách đánh số và
 * xuống dòng. Thêm react-markdown kéo theo remark cùng cả cây phụ thuộc cho ngần
 * ấy thứ, mà repo lại đang sắp đồng bộ với staging — càng ít đụng vào
 * package-lock.json càng ít chỗ vỡ.
 *
 * HÀNG RÀO AN TOÀN LÀ DOMPurify, KHÔNG PHẢI HÀM `render` DƯỚI ĐÂY. Chữ đi vào đây
 * là chữ do một mô hình ngôn ngữ sinh ra từ tài liệu, tức là không phải chữ ta viết
 * và không nên tin. Hàm `render` chỉ cần đúng ở mức dễ đọc; việc chặn thẻ script,
 * thuộc tính onerror, href javascript: là việc của DOMPurify. Đừng bao giờ đảo thứ
 * tự đó, và đừng bao giờ bỏ bước sanitize vì "chữ này của mình mà".
 */

/** Đổi ký tự có nghĩa trong HTML thành thực thể. Chạy TRƯỚC mọi bước dựng. */
function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** Đậm, nghiêng, mã ngắn, liên kết — những thứ nằm gọn trong một dòng. */
function inline(s) {
  return (
    s
      // Mã ngắn dựng TRƯỚC: bên trong dấu huyền thì ** là hai dấu sao, không phải đậm.
      .replace(/`([^`\n]+)`/g, '<code class="rounded bg-black/5 px-1 py-0.5 text-[0.9em]">$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
      // Nghiêng dùng một dấu sao, nhưng phải né snake_case nên không nhận dấu gạch dưới.
      .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
      .replace(
        /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noreferrer noopener" class="underline">$1</a>',
      )
  )
}

/**
 * Trả về chuỗi HTML đã làm sạch, sẵn sàng cho dangerouslySetInnerHTML.
 *
 * Trả về "" khi đầu vào rỗng, để phía gọi phân biệt được "chưa có chữ nào" với
 * "có chữ nhưng dựng ra rỗng".
 */
export function renderMarkdown(text) {
  if (!text) return ""

  const lines = escapeHtml(String(text)).split("\n")
  const out = []
  let list = null // "ul" | "ol" | null

  const closeList = () => {
    if (list) {
      out.push(`</${list}>`)
      list = null
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    const bullet = line.match(/^\s*[-*+]\s+(.*)$/)
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/)

    if (bullet || numbered) {
      const want = bullet ? "ul" : "ol"
      if (list !== want) {
        closeList()
        const cls = want === "ul" ? "list-disc" : "list-decimal"
        out.push(`<${want} class="my-1 ${cls} space-y-0.5 pl-5">`)
        list = want
      }
      out.push(`<li>${inline((bullet || numbered)[1])}</li>`)
      continue
    }

    closeList()
    if (!line.trim()) continue
    // Tiêu đề markdown: giữ chữ, bỏ dấu thăng. Bong bóng chat rộng 380px, một thẻ
    // h2 cỡ chữ lớn trong đó nhìn như lỗi bố cục chứ không như tiêu đề.
    const heading = line.match(/^\s*#{1,6}\s+(.*)$/)
    out.push(
      heading
        ? `<p class="font-semibold">${inline(heading[1])}</p>`
        : `<p>${inline(line)}</p>`,
    )
  }
  closeList()

  return DOMPurify.sanitize(out.join(""), {
    ALLOWED_TAGS: ["p", "strong", "em", "code", "ul", "ol", "li", "a", "br"],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
    // Chặn mọi giao thức lạ ở href. javascript: và data: không có việc gì ở đây.
    ALLOWED_URI_REGEXP: /^https?:\/\//i,
  })
}

/**
 * Xoá mã trích dẫn [S1], [S2]… khỏi chữ hiện cho người dùng.
 *
 * Mã vẫn được sinh ra và vẫn được kiểm ở phía server — đó là thứ chặn mô hình bịa:
 * `read/rag/generation.py` đối chiếu từng mã với danh sách nguồn thật, mã nào trỏ
 * vào chỗ không có thì bị gỡ và câu trả lời bị hạ mức tin cậy. Chỉ số "trích dẫn
 * hợp lệ 100%" trong biên bản nghiệm thu đo đúng cơ chế đó.
 *
 * Nhưng người dùng thật không hiểu [S1] là gì, nên nó dừng lại ở đây, ngay trước
 * lúc vẽ ra màn hình. Nguyên văn có mã vẫn nằm trong ai.rag_query_logs để tra khi
 * có khiếu nại.
 */
export function stripCitations(text) {
  if (!text) return text
  return (
    String(text)
      // [S1] hoặc [S1, S2] hoặc [S1][S3].
      // Dùng [ \t]* chứ không \s*: \s nuốt cả xuống dòng, và một mã đứng đầu dòng
      // sẽ kéo dòng đó dính vào dòng trên.
      .replace(/[ \t]*\[\s*S\d+(\s*,\s*S?\d+)*\s*\]/gi, "")
      // Mảnh dở dang ở cuối luồng: "[S" hay "[S1" chưa kịp đóng ngoặc. Không xử lý
      // thì mỗi câu trả lời chảy dần đều nhấp nháy một mẩu rác ở cuối dòng.
      .replace(/[ \t]*\[\s*S\d*$/i, "")
      // Dọn khoảng trắng thừa mã để lại.
      .replace(/[ \t]+([.,;:!?])/g, "$1")
      .replace(/[ \t]{2,}/g, " ")
      // Mã đứng đầu dòng để lại một dấu cách thừa ở đầu dòng đó.
      .replace(/(^|\n)[ \t]+/g, "$1")
      .trimEnd()
  )
}
