import { useEffect } from "react"
import { useNavigate, useOutletContext, useParams } from "react-router-dom"
import { speakingApi, useGetSpeakingReportQuery, useGetSpeakingSessionQuery } from "../api/speakingApi"

const TERMINAL = new Set(["completed", "abandoned"])

const SpeakingResultPage = () => {
  const { sessionId, lang = "zh" } = useParams()
  const navigate = useNavigate()
  const { setSessionCredentials } = useOutletContext()
  const cachedSession = speakingApi.endpoints.getSpeakingSession.useQueryState(sessionId)
  const { data: session, isLoading: loadingSession, isError: sessionFailed, error: sessionError, refetch: refetchSession } = useGetSpeakingSessionQuery(sessionId, {
    pollingInterval: cachedSession.isError || TERMINAL.has(cachedSession.data?.status) ? 0 : 1000,
  })
  const terminal = TERMINAL.has(session?.status)
  const { data: report, isLoading: loadingReport, isError, refetch } = useGetSpeakingReportQuery(sessionId, { skip: !terminal })

  useEffect(() => {
    if (terminal) setSessionCredentials(null)
  }, [setSessionCredentials, terminal])

  const backToCatalog = () => navigate(`/${lang}/ai-tutor/speaking-room`, { replace: true })

  if (sessionFailed) {
    return <div className="mx-auto max-w-xl py-20 text-center"><p className="text-sm text-rose-800">{sessionError?.message || "Không thể tải trạng thái phiên."}</p><button className="mt-4 px-4 py-2 font-bold text-[#990011] underline" onClick={refetchSession}>Thử lại</button><button className="mt-4 px-4 py-2 font-bold text-[#990011] underline" onClick={backToCatalog}>Về danh mục</button></div>
  }

  if (loadingSession || !terminal) {
    return <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 text-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-[#990011]" /><h1 className="text-xl font-bold text-slate-900">Đang hoàn tất buổi luyện nói</h1><p className="text-sm text-slate-600">Báo cáo sẽ xuất hiện khi máy chủ lưu xong dữ liệu phiên.</p><button className="text-sm font-semibold text-[#990011] underline" onClick={refetchSession}>Kiểm tra lại</button></div>
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
      <header className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
        <div><h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">BÁO CÁO BUỔI LUYỆN NÓI</h1><p className="mt-1 text-sm text-slate-500">{session.topic?.title_vi || "Luyện nói tiếng Trung"} · HSK {session.hsk_level}</p></div>
        <button onClick={backToCatalog} className="self-start text-sm font-semibold text-slate-600 hover:text-[#990011]">Về danh mục</button>
      </header>
      {session.status === "abandoned" && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Phiên đã dừng trước khi hoàn tất. Đây là dữ liệu hiện có của buổi luyện nói.</div>}
      {loadingReport ? <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Đang tải báo cáo...</p> : isError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">Không thể tải báo cáo lúc này.<button className="ml-3 font-bold underline" onClick={refetch}>Thử lại</button></div> : report ? <>
        <section className="grid gap-4 sm:grid-cols-3">
          <Metric label="Lượt hoàn thành" value={report.turns_completed} />
          <Metric label="Lượt bỏ qua" value={report.turns_skipped} />
          <Metric label="Thời lượng" value={report.duration_seconds == null ? "—" : `${Math.floor(report.duration_seconds / 60)}:${String(report.duration_seconds % 60).padStart(2, "0")}`} />
        </section>
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5"><h2 className="font-bold text-emerald-900">Nhận xét buổi học</h2><p className="mt-2 text-sm leading-relaxed text-emerald-950">{report.summary || "Chưa có nhận xét cho phiên này."}</p></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold text-slate-900">Từ vựng đề xuất ôn tập</h2>{report.recommended_vocab?.length ? <ul className="mt-3 flex flex-wrap gap-2">{report.recommended_vocab.map((word, index) => <li key={`${word}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">{word}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500">Chưa có từ vựng được đề xuất.</p>}</section>
        <p className="text-xs text-slate-500">Phân tích phát âm chưa có dữ liệu cho phiên này.</p>
      </> : null}
      <button onClick={backToCatalog} className="rounded-xl bg-[#990011] px-6 py-3 text-sm font-bold text-white">Quay về danh mục</button>
    </div>
  )
}

const Metric = ({ label, value }) => <div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-3xl font-extrabold text-[#990011]">{value ?? "—"}</p></div>

export default SpeakingResultPage
