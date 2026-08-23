import React, { useState } from 'react'
import ClassCard from '../components/overview/ClassCard'
import NextSessionCard from '../components/overview/NextSessionCard'
import Tabs from '@/shared/components/ui/navigation/Tabs'
import { EmptyState } from '@/shared/components/ui/indicators'
import { Breadcrumb } from '@/shared/components/ui/navigation'
import PageTitle from '@/shared/components/ui/PageTitle'
import { useNavigate } from 'react-router-dom'
import { PillButton } from '@/shared/components/ui/buttons'

const MyLearningOverview = ({ onShowAll }) => {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("registered")

  const tabs = [
    { id: "registered", label: "Đã đăng ký", badge: 5 },
    { id: "completed", label: "Hoàn thành", badge: 1 },
    { id: "cancelled", label: "Đã huỷ", badge: 0 },
  ]

  return (
    <div className="space-y-6">

      <Breadcrumb
        items={[
          { label: "Trang chủ", onClick: () => navigate("/") },
          { label: "Lớp học của tôi" },
        ]}
      />

      <PageTitle className="text-[#1A1A1A]">
        Buổi học sắp diễn ra
      </PageTitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NextSessionCard status="Live" date="Hôm nay, 15/07/2026" />
        <NextSessionCard status="Open Enrollment" date="18/08/2026" />
        <NextSessionCard status="Open Enrollment" date="18/08/2026" />
      </div>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        fullWidth={false}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeTab === "registered" && (
          <>
            <ClassCard />
            <ClassCard title="Lớp giao tiếp cơ bản" progress={10} />
            <ClassCard title="Lớp tiếng anh thương mại" progress={60} />
          </>
        )}

        {activeTab === "completed" && (
          <ClassCard title="Phát âm chuẩn xác" progress={100} />
        )}

        {activeTab === "cancelled" && (
          <div className='w-full flex-1'>
            <EmptyState variant="page" />
          </div>
        )}
      </div>

      <div className='flex justify-center items-end'>
        <PillButton variant='secondary-no-outline' textColor={"#990011"} onClick={onShowAll}>
          Xem tất cả
        </PillButton>
      </div>
    </div>
  )
}

export default MyLearningOverview