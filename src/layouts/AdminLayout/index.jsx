
import { Outlet, ScrollRestoration } from "react-router-dom"

const AdminLayout = () => (
  <div className="flex flex-col min-h-screen bg-[#08030a] text-white">
    <header className="flex items-center justify-between bg-black/40 px-8 py-4 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          Admin
        </p>
        <h1 className="text-lg font-semibold text-white">
          CathSpeak Control Center
        </h1>
      </div>
      <span className="text-sm text-white/70">Xin chào, Quản trị viên</span>
    </header>
    <main className="flex-1 px-8 py-10">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/30 backdrop-blur">
        <Outlet />
      </div>
    </main>
    <ScrollRestoration />
  </div>
)

export default AdminLayout
