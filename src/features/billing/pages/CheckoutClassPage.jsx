import React, { useState } from 'react'
import ClassInfoSection from '../checkout-class/components/ClassInfoSection'
import LearnerSection from '../checkout-class/components/LearnerSection'
import OrderSummary from '../checkout-class/components/OrderSummary'
import VoucherModal from '../checkout-class/components/VoucherModal'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Breadcrumb } from '@/shared/components/ui/navigation'
import { useGetVouchersForClassQuery } from '@/store/api/voucherApi'
import { useGetExploreClassDetailQuery } from '@/store/api/coursesApi'
import { useCheckoutMutation, useLazyLookupLearnerQuery } from '@/store/api/paymentsApi'
import { useTimezone } from '@/shared/hooks/useTimezone'
import { useGetProfileQuery } from '@/store/api/authApi'
import { useLanguage } from '@/shared/context/LanguageContext'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { defaultCourseThumbnail } from '@/features/courses/utils/courseUtils'
import { calculateVoucherDiscount } from '../utils/checkoutUtils'

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
  const { t } = useLanguage()
  const tc = t.billing.checkoutClass
  const navigate = useNavigate()

  const { data: profileResponse } = useGetProfileQuery()
  const currentUser = profileResponse?.data || profileResponse

  const [learners, setLearners] = useState(() => {
    if (currentUser) {
      return [{
        id: currentUser.id || currentUser.accountId || 'user_1',
        name: currentUser.fullName || currentUser.name || tc.fallbackName,
        avatarImageUrl: currentUser.avatarImageUrl || '',
        email: currentUser.email || '',
        isPayer: true
      }]
    }
    return []
  })

  useEffect(() => {
    if (currentUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLearners(prev => {
        if (prev.length === 0 || !prev[0]?.email) {
          const newLearners = [...prev]
          newLearners[0] = {
            id: currentUser.id || currentUser.accountId || 'user_1',
            name: currentUser.fullName || currentUser.name || tc.fallbackName,
            avatarImageUrl: currentUser.avatarImageUrl || '',
            email: currentUser.email || '',
            isPayer: true
          }
          return newLearners
        }
        return prev
      })
    }
  }, [currentUser, tc.fallbackName])

  const [selectedVouchers, setSelectedVouchers] = useState([])
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)

  // Fetch Class Detail
  const { data: classDetail, isLoading: isLoadingClass, error: classError } = useGetExploreClassDetailQuery(classId, { skip: !classId })

  const classData = classDetail ? {
    thumbnailUrl: classDetail.thumbnailUrl || defaultCourseThumbnail,
    courseName: classDetail.courseName || tc.fallbackCourseName,
    classCode: classDetail.name,
    className: classDetail.name,
    availableSlots: classDetail.remainingSlots,
    maxSlots: classDetail.capacity,
    schedule: formatWeeklySchedule(classDetail, tc.fallbackNoSchedule),
    dateRange: `${classDetail.startDate ? formatDate(classDetail.startDate) : tc.fallbackUpdating} - ${classDetail.endDate ? formatDate(classDetail.endDate) : tc.fallbackUpdating}`,
    totalSessions: classDetail.totalSessions,
    teacher: classDetail.teacher?.name,
    tags: [classDetail.language, ...classDetail.levels].filter(Boolean),
    unitPrice: classDetail.price
  } : {}

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

  useEffect(() => {
    if (resolvedVoucherData.availableVouchers.length > 0 || selectedVouchers.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedVouchers(prev => {
        const validSelected = prev.filter(selected =>
          resolvedVoucherData.availableVouchers.some(available => available.id === selected.id)
        )

        return validSelected.map(selected =>
          resolvedVoucherData.availableVouchers.find(available => available.id === selected.id) || selected
        )
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedVoucherData.availableVouchers])

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
        return { success: false, message: response.message || tc.fallbackAccountNotFound }
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
        return { success: false, message: tc.fallbackAccountNotFound }
      }
    } catch (error) {
      return { success: false, message: error?.data?.message || tc.fallbackAccountNotFound }
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
      const expectedTotalDiscountVnd = selectedVouchers.reduce((sum, v) => sum + calculateVoucherDiscount(v, subtotal), 0)

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
        toast.success(tc.paymentSuccess)
      }
    } catch (error) {
      const errMsg = error?.data?.message || error?.error || tc.paymentError

      const voucherMatch = errMsg.match(/Voucher (.*?) không khả dụng/i)
      if (voucherMatch) {
        const voucherCode = voucherMatch[1]
        setSelectedVouchers(prev => prev.filter(v => v.code !== voucherCode))
        toast.error(tc.voucherUnavailable.replace('{{code}}', voucherCode))
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
          <h2 className="text-xl font-bold text-[#B20000] mb-2">{tc.classNotFound}</h2>
          <p className="text-gray-600 mb-4">{tc.classNotFoundDesc}</p>
          <Link to="/" className="text-[#1864AB] font-semibold hover:underline">{tc.backToHome}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <div className="p-4 md:p-6 space-y-6">

        <Breadcrumb
          className='flex-wrap'
          items={[
            { label: tc.breadcrumbHome, onClick: () => navigate('/') },
            { label: tc.breadcrumbExplore, onClick: () => navigate('/explore-courses') },
            // { label: tc.breadcrumbCourseDetail, onClick: () => navigate(`/explore-courses/details/${course.id}`) },
            { label: tc.breadcrumbClassDetail, onClick: () => navigate(`/explore-courses/class/${classId}`) },
            { label: tc.breadcrumbCheckout }
          ]} />

        <h1 className="text-3xl font-bold text-[#1A1C1C]">{tc.pageTitle}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <ClassInfoSection classData={classData} t={t} />
            <LearnerSection
              learners={learners}
              onAddLearner={handleAddLearner}
              onRemoveLearner={handleRemoveLearner}
              maxSlots={classData.availableSlots}
              t={t}
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
              t={t}
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
        t={t}
      />
    </div>
  )
}

export default CheckoutClassPage