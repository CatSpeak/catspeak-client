import React from "react"
import { LogIn } from "lucide-react"

const LoginRequiredModal = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-cardBg w-full max-w-md rounded-2xl shadow-xl border border-border p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-cath-red-50 dark:bg-cath-red-950/30 text-cath-red-600 flex items-center justify-center mx-auto">
          <LogIn className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Yêu cầu đăng nhập
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vui lòng đăng nhập vào hệ thống để lưu từ vựng vào sổ tay Flashcard cá nhân.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-gray-100 dark:hover:bg-hoverBg text-gray-700 dark:text-gray-300 transition-colors"
          >
            Để sau
          </button>
          <button
            type="button"
            onClick={onLogin}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-xl bg-cath-red-600 hover:bg-cath-red-700 text-white shadow-sm transition-colors"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginRequiredModal
