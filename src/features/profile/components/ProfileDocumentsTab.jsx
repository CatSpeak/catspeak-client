import React from "react"
import { FileText, Download, MoreVertical } from "lucide-react"

const MOCK_DOCUMENTS = [
  { id: 1, name: "Project_Proposal_2026.pdf", type: "pdf", size: "2.4 MB", date: "10 Thg 7, 2026" },
  { id: 2, name: "Meeting_Notes.docx", type: "doc", size: "156 KB", date: "8 Thg 7, 2026" },
  { id: 3, name: "Financial_Report_Q2.xlsx", type: "xls", size: "1.1 MB", date: "5 Thg 7, 2026" },
  { id: 4, name: "Design_Assets.zip", type: "zip", size: "45 MB", date: "1 Thg 7, 2026" },
  { id: 5, name: "Client_Brief.pdf", type: "pdf", size: "890 KB", date: "28 Thg 6, 2026" },
]

const ProfileDocumentsTab = () => {
  return (
    <div className="w-full pb-20">
      <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-6 min-h-[500px]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Tài liệu chia sẻ</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_DOCUMENTS.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#990011]/20 hover:shadow-sm transition-all group cursor-pointer bg-white">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-[#990011] flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-gray-900 text-[15px] truncate">{doc.name}</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>{doc.size}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{doc.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-400 hover:text-[#990011] rounded-full hover:bg-red-50 transition-colors">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProfileDocumentsTab
