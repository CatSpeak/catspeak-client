import React, { useState } from 'react'
import ClassInfoSection from '../checkout-class/components/ClassInfoSection'
import LearnerSection from '../checkout-class/components/LearnerSection'
import OrderSummary from '../checkout-class/components/OrderSummary'
import VoucherModal from '../checkout-class/components/VoucherModal'
import { Link, useParams } from 'react-router-dom'
import { MOCK_CLASS_DATA, MOCK_PAYER } from '../mock/voucher'
import { Breadcrumb } from '@/shared/components/ui/navigation'
import { useGetVouchersForClassQuery } from '@/store/api/voucherApi'

const EMPTY_VOUCHER_DATA = {
  availableVouchers: [],
  suggestedTags: [],
  notApplicableForClass: [],
  notEligible: [],
  expired: [],
  exhausted: [],
}

const CheckoutClassPage = () => {
  const { id: classId } = useParams()
  const [learners, setLearners] = useState([MOCK_PAYER])
  const [selectedVouchers, setSelectedVouchers] = useState([])
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)

  // Fetch vouchers from API
  const {
    data: voucherData,
  } = useGetVouchersForClassQuery(
    {
      classId,
      learnersCount: learners.length,
      orderAmount: MOCK_CLASS_DATA.unitPrice * learners.length,
    },
    { skip: !classId }
  )

  // Use API data if available, otherwise use empty defaults
  const resolvedVoucherData = voucherData || EMPTY_VOUCHER_DATA

  const handleAddLearner = (email) => {
    const newLearner = {
      id: `user_${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      isPayer: false
    }
    setLearners([...learners, newLearner])
  }

  const handleRemoveLearner = (id) => {
    setLearners(learners.filter(l => l.id !== id))
  }

  const handleToggleVoucher = (voucher) => {
    if (selectedVouchers.find(v => v.id === voucher.id)) {
      setSelectedVouchers(selectedVouchers.filter(v => v.id !== voucher.id))
    } else {
      if (selectedVouchers.length < 2) {
        setSelectedVouchers([...selectedVouchers, voucher])
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <div className="p-4 md:p-6 space-y-6">

        <Breadcrumb items={[
          { label: 'Trang chủ' },
          { label: 'Khám phá khóa học' },
          { label: 'Chi tiết khóa học' },
          { label: 'Chi tiết lớp học' },
          { label: 'Thanh toán lớp học' }
        ]} />

        <h1 className="text-3xl font-bold text-[#1A1C1C]">Thanh toán lớp học</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <ClassInfoSection classData={MOCK_CLASS_DATA} />
            <LearnerSection
              learners={learners}
              onAddLearner={handleAddLearner}
              onRemoveLearner={handleRemoveLearner}
              maxSlots={MOCK_CLASS_DATA.availableSlots}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <OrderSummary
              courseName={MOCK_CLASS_DATA.courseName}
              classCode={MOCK_CLASS_DATA.classCode}
              unitPrice={MOCK_CLASS_DATA.unitPrice}
              learnersCount={learners.length}
              vouchers={resolvedVoucherData.availableVouchers}
              suggestedTags={resolvedVoucherData.suggestedTags}
              selectedVouchers={selectedVouchers}
              onToggleVoucher={handleToggleVoucher}
              onOpenModal={() => setIsVoucherModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <VoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        voucherData={resolvedVoucherData}
        selectedVouchers={selectedVouchers}
        onToggleVoucher={handleToggleVoucher}
      />
    </div>
  )
}

export default CheckoutClassPage