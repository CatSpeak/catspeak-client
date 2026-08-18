import React, { useState } from 'react'
import ClassInfoSection from '../checkout-class/components/ClassInfoSection'
import LearnerSection from '../checkout-class/components/LearnerSection'
import OrderSummary from '../checkout-class/components/OrderSummary'
import VoucherModal from '../checkout-class/components/VoucherModal'
import { Link, useParams } from 'react-router-dom'
import { MOCK_CLASS_DATA, MOCK_PAYER } from '../mock/voucher'
import { Breadcrumb } from '@/shared/components/ui/navigation'
import { useGetVouchersForClassQuery } from '@/store/api/voucherApi'
import { useGetExploreClassDetailQuery } from '@/store/api/coursesApi'
import { useCheckoutMutation, useLazyLookupLearnerQuery } from '@/store/api/paymentsApi'
import { useTimezone } from '@/shared/hooks/useTimezone'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'

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
  const { formatWeeklySchedule, formatDate } = useTimezone()
  const currentUser = useSelector(selectCurrentUser)
  console.log("currentUser", currentUser)

  const [learners, setLearners] = useState(() => {
    if (currentUser) {
      return [{
        id: currentUser.id || currentUser.accountId || 'user_1',
        name: currentUser.fullName || currentUser.name || 'Bạn',
        avatarImageUrl: currentUser.avatarImageUrl || '',
        email: currentUser.email || '',
        isPayer: true
      }]
    }
    return [MOCK_PAYER]
  })

  useEffect(() => {
    if (currentUser) {
      setLearners(prev => {
        if (prev[0]?.id === MOCK_PAYER.id || !prev[0]?.email) {
          const newLearners = [...prev]
          newLearners[0] = {
            id: currentUser.id || currentUser.accountId || 'user_1',
            name: currentUser.fullName || currentUser.name || 'Bạn',
            avatarImageUrl: currentUser.avatarImageUrl || '',
            email: currentUser.email || '',
            isPayer: true
          }
          return newLearners
        }
        return prev
      })
    }
  }, [currentUser])

  const [selectedVouchers, setSelectedVouchers] = useState([])
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)

  // Fetch Class Detail
  const { data: classDetail, isLoading: isLoadingClass, error: classError } = useGetExploreClassDetailQuery(classId, { skip: !classId })

  const classData = classDetail ? {
    courseName: classDetail.courseName || "Lớp học độc lập",
    classCode: classDetail.name,
    className: classDetail.name,
    availableSlots: classDetail.remainingSlots,
    maxSlots: classDetail.capacity,
    schedule: formatWeeklySchedule(classDetail, "Chưa có lịch"),
    dateRange: `${classDetail.startDate ? formatDate(classDetail.startDate) : 'Đang cập nhật'} - ${classDetail.endDate ? formatDate(classDetail.endDate) : 'Đang cập nhật'}`,
    totalSessions: classDetail.totalSessions,
    teacher: classDetail.teacher?.name,
    tags: [classDetail.language, ...classDetail.levels].filter(Boolean),
    unitPrice: classDetail.price
  } : MOCK_CLASS_DATA

  // Fetch vouchers from API
  const {
    data: voucherData,
    refetch: refetchVouchers,
  } = useGetVouchersForClassQuery(
    {
      classId,
      learnersCount: learners.length,
    },
    { skip: !classId }
  )

  // Use API data if available, otherwise use empty defaults
  const resolvedVoucherData = voucherData || EMPTY_VOUCHER_DATA

  const [lookupLearner] = useLazyLookupLearnerQuery()

  const handleAddLearner = async (email) => {
    // Current account ids to prevent duplicate lookup and check backend
    const currentAccountIds = learners.map(l => l.id)

    try {
      const response = await lookupLearner({
        email,
        classId,
        currentAccountIds
      }).unwrap()

      // If backend returns success: false with HTTP 200, baseApi does not unwrap it
      if (response.success === false) {
        return { success: false, message: response.message || "Không tìm thấy tài khoản với email này." }
      }

      // If success: true, baseApi unwraps it, so response IS the data object
      if (response.accountId) {
        const newLearner = {
          id: response.accountId,
          name: response.username,
          avatarImageUrl: response.avatarImageUrl,
          email: response.email,
          isPayer: false
        }
        setLearners([...learners, newLearner])
        return { success: true }
      } else {
        return { success: false, message: "Không tìm thấy tài khoản với email này." }
      }
    } catch (error) {
      return { success: false, message: error?.data?.message || "Không tìm thấy tài khoản với email này." }
    }
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

  const [checkout, { isLoading: isCheckoutLoading }] = useCheckoutMutation()

  const handleCheckout = async () => {
    try {
      const subtotal = classData.unitPrice * learners.length
      const calculateDiscount = (voucher) => {
        if (voucher.estimatedDiscountAmount) return voucher.estimatedDiscountAmount
        const isPercentage = voucher.discountType?.toLowerCase() === 'percentage'
        if (isPercentage) {
          const discount = (subtotal * voucher.discountValue) / 100
          if (voucher.maxDiscountAmount) return Math.min(discount, voucher.maxDiscountAmount)
          return discount
        }
        return voucher.discountValue || 0
      }
      const expectedTotalDiscountVnd = selectedVouchers.reduce((sum, v) => sum + calculateDiscount(v), 0)

      const result = await checkout({
        paymentType: "ClassEnrollment",
        classId: Number(classId),
        voucherIds: selectedVouchers.map(v => Number(v.voucherId || v.id)),
        learnerAccountIds: learners.filter(l => !l.isPayer).map(l => Number(l.id)),
        expectedTotalDiscountVnd,
        confirmScheduleConflict: false,
        pendingClassData: "",
        returnUrl: `${window.location.origin}/workspace/learning/class/${classId}`,
        cancelUrl: window.location.origin + window.location.pathname,
        planId: 0,
      }).unwrap()

      const resultPayload = (
        result
        && typeof result === "object"
        && !Array.isArray(result)
        && Object.prototype.hasOwnProperty.call(result, "data")
      )
        ? result.data
        : result

      if (resultPayload?.checkoutUrl) {
        window.location.href = resultPayload.checkoutUrl
      } else {
        toast.success("Thanh toán thành công!")
      }
    } catch (error) {
      const errMsg = error?.data?.message || error?.error || "Đã xảy ra lỗi khi thanh toán."

      const voucherMatch = errMsg.match(/Voucher (.*?) không khả dụng/i)
      if (voucherMatch) {
        const voucherCode = voucherMatch[1]
        setSelectedVouchers(prev => prev.filter(v => v.code !== voucherCode))
        toast.error(`Mã ${voucherCode} không còn khả dụng, đã tự động gỡ khỏi đơn hàng`)
      } else if (errMsg.includes("Số tiền giảm giá của Voucher đã thay đổi")) {
        toast.error(errMsg)
        refetchVouchers()
      } else {
        toast.error(errMsg)
      }
    }
  }

  if (isLoadingClass) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B20000]" />
      </div>
    )
  }

  if (classError && !classDetail) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow">
          <h2 className="text-xl font-bold text-[#B20000] mb-2">Không tìm thấy lớp học</h2>
          <p className="text-gray-600 mb-4">Lớp học này có thể không tồn tại hoặc đã bị xóa.</p>
          <Link to="/" className="text-[#1864AB] font-semibold hover:underline">Quay lại trang chủ</Link>
        </div>
      </div>
    )
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
            <ClassInfoSection classData={classData} />
            <LearnerSection
              learners={learners}
              onAddLearner={handleAddLearner}
              onRemoveLearner={handleRemoveLearner}
              maxSlots={classData.availableSlots}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <OrderSummary
              courseName={classData.courseName}
              classCode={classData.classCode}
              className={classData.className}
              unitPrice={classData.unitPrice}
              learnersCount={learners.length}
              vouchers={resolvedVoucherData.availableVouchers}
              suggestedTags={resolvedVoucherData.suggestedTags}
              selectedVouchers={selectedVouchers}
              onToggleVoucher={handleToggleVoucher}
              onRemoveVoucher={(id) => setSelectedVouchers(selectedVouchers.filter(v => v.id !== id))}
              onOpenModal={() => setIsVoucherModalOpen(true)}
              onCheckout={handleCheckout}
              isProcessing={isCheckoutLoading}
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