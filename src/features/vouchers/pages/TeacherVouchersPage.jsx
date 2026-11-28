import React from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import PageTitle from "@/shared/components/ui/PageTitle"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import VouchersTab from "../components/VouchersTab"

/**
 * ISS-22: standalone teacher voucher management screen at /workspace/vouchers.
 * VouchersTab with scope="all" queries every instructor voucher
 * (sponsorType=Instructor) with no classId/courseId filter.
 */
const TeacherVouchersPage = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const vt = t.vouchers || {}

  return (
    <div className="flex flex-col gap-4 p-4">
      <Breadcrumb
        items={[
          {
            label: t.nav?.workspace || "Workspace",
            onClick: () => navigate("/workspace/dashboard"),
          },
          {
            label: vt.pageTitle || "Quản lý Voucher & Ưu đãi",
          },
        ]}
      />

      <div className="flex flex-col gap-1">
        <PageTitle>{vt.pageTitle || "Quản lý Voucher & Ưu đãi"}</PageTitle>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          {vt.pageSubtitle ||
            "Tạo và quản lý các chương trình ưu đãi, mã giảm giá cho các khóa học và lớp học của bạn."}
        </p>
      </div>

      <VouchersTab scope="all" />
    </div>
  )
}

export default TeacherVouchersPage
