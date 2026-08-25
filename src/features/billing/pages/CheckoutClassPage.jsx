import React, { useState } from "react";
import ClassInfoSection from "../checkout-class/components/ClassInfoSection";
import LearnerSection from "../checkout-class/components/LearnerSection";
import OrderSummary from "../checkout-class/components/OrderSummary";
import VoucherModal from "../checkout-class/components/VoucherModal";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal";
import { Breadcrumb } from "@/shared/components/ui/navigation";
import { useGetVouchersForClassQuery } from "@/store/api/voucherApi";
import { useGetExploreClassDetailQuery } from "@/store/api/coursesApi";
import {
  useCheckoutMutation,
  useLazyLookupLearnerQuery,
} from "@/store/api/paymentsApi";
import { useTimezone } from "@/shared/hooks/useTimezone";
import { useGetProfileQuery } from "@/store/api/authApi";
import { useGetFriendsQuery } from "@/store/api/social/friendshipApi";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  defaultCourseThumbnail,
  getSafeMediaUrl,
  getClassEnrollmentIssue,
  getClassEnrollmentIssueMessage,
} from "@/features/courses/utils/courseUtils";
import { calculateVoucherDiscount } from "../utils/checkoutUtils";

const EMPTY_VOUCHER_DATA = {
  availableVouchers: [],
  suggestedTags: [],
  notApplicableForClass: [],
  notEligible: [],
  expired: [],
  exhausted: [],
};

const CheckoutClassPage = () => {
  const { id: classId } = useParams();
  const { formatWeeklySchedule, formatDate } = useTimezone();
  const { t } = useLanguage();
  const tc = t.billing.checkoutClass;
  const pc = t.courses?.publicClassDetail;
  const navigate = useNavigate();

  const { data: profileResponse } = useGetProfileQuery();
  const currentUser = profileResponse?.data || profileResponse;
  const currentAccountId = currentUser?.id || currentUser?.accountId;

  const { data: friendsData } = useGetFriendsQuery(currentAccountId, {
    skip: !currentAccountId,
  });
  const friendsList = Array.isArray(friendsData)
    ? friendsData
    : Array.isArray(friendsData?.data)
    ? friendsData.data
    : [];

  const [learners, setLearners] = useState(() => {
    if (currentUser) {
      return [
        {
          id: currentUser.id || currentUser.accountId || "user_1",
          name: currentUser.fullName || currentUser.name || tc.fallbackName,
          avatarImageUrl: currentUser.avatarImageUrl || "",
          email: currentUser.email || "",
          isPayer: true,
        },
      ];
    }
    return [];
  });

  useEffect(() => {
    if (currentUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLearners((prev) => {
        if (prev.length === 0 || !prev[0]?.email) {
          const newLearners = [...prev];
          newLearners[0] = {
            id: currentUser.id || currentUser.accountId || "user_1",
            name: currentUser.fullName || currentUser.name || tc.fallbackName,
            avatarImageUrl: currentUser.avatarImageUrl || "",
            email: currentUser.email || "",
            isPayer: true,
          };
          return newLearners;
        }
        return prev;
      });
    }
  }, [currentUser, tc.fallbackName]);

  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [conflictClasses, setConflictClasses] = useState(null);

  // Fetch Class Detail
  const {
    data: classDetail,
    isLoading: isLoadingClass,
    error: classError,
  } = useGetExploreClassDetailQuery(classId, { skip: !classId });

  const classData = classDetail
    ? {
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
        unitPrice: classDetail.price,
      }
    : {};

  useEffect(() => {
    if (classDetail && !isLoadingClass) {
      const enrollmentIssue = getClassEnrollmentIssue({
        classData: classDetail,
      });
      const isUpcoming =
        enrollmentIssue === "upcoming" ||
        String(classDetail.status || "").toUpperCase() === "UPCOMING";

      if (enrollmentIssue || isUpcoming) {
        toast.error(
          getClassEnrollmentIssueMessage(enrollmentIssue || "upcoming", pc),
        );

        const isWorkspace = window.location.pathname.startsWith("/workspace");
        const basePath = isWorkspace ? "/workspace" : "";
        navigate(`${basePath}/explore-courses/class/${classId}`, {
          replace: true,
        });
      }
    }
  }, [classDetail, isLoadingClass, navigate, classId, pc]);

  // Fetch vouchers from API
  const {
    data: voucherData,
    isLoading: isLoadingVouchers,
    isFetching: isFetchingVouchers,
    refetch: refetchVouchers,
  } = useGetVouchersForClassQuery(
    {
      classId,
      learnersCount: learners.length,
    },
    { skip: !classId },
  );

  // Use API data if available, otherwise use empty defaults
  const resolvedVoucherData = voucherData || EMPTY_VOUCHER_DATA;

  useEffect(() => {
    if (
      resolvedVoucherData.availableVouchers.length > 0 ||
      selectedVouchers.length > 0
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedVouchers((prev) => {
        const validSelected = prev.filter((selected) =>
          resolvedVoucherData.availableVouchers.some(
            (available) => available.id === selected.id,
          ),
        );

        return validSelected.map(
          (selected) =>
            resolvedVoucherData.availableVouchers.find(
              (available) => available.id === selected.id,
            ) || selected,
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedVoucherData.availableVouchers]);

  const [lookupLearner] = useLazyLookupLearnerQuery();

  const handleAddLearner = async (email) => {
    const currentAccountIds = learners.map((learner) => learner.id);

    try {
      const response = await lookupLearner({
        email,
        classId,
        currentAccountIds,
      }).unwrap();

      if (response.success === false) {
        return {
          success: false,
          message: getErrorMessage(
            response.errorCode,
            response.message || tc.fallbackAccountNotFound,
          ),
        };
      }

      if (response.accountId) {
        const newLearner = {
          id: response.accountId,
          name: response.username,
          avatarImageUrl: response.avatarImageUrl,
          email: response.email,
          isPayer: false,
        };

        setLearners((prev) => [...prev, newLearner]);
        return { success: true };
      }

      return {
        success: false,
        message: tc.fallbackAccountNotFound,
      };
    } catch (error) {
      const responseData = error?.data?.data || error?.data || {};

      return {
        success: false,
        message: getErrorMessage(
          responseData.errorCode,
          responseData.message || error?.error || tc.addLearnerError,
        ),
      };
    }
  };

  const handleRemoveLearner = (id) => {
    setLearners(learners.filter((l) => l.id !== id));
  };

  const handleToggleVoucher = (voucher) => {
    if (selectedVouchers.find((v) => v.id === voucher.id)) {
      setSelectedVouchers(selectedVouchers.filter((v) => v.id !== voucher.id));
    } else {
      if (selectedVouchers.length < 2) {
        setSelectedVouchers([...selectedVouchers, voucher]);
      }
    }
  };

  const [checkout, { isLoading: isCheckoutLoading }] = useCheckoutMutation();

  const getErrorMessage = (code, fallback) => {
    if (!code) return fallback;
    const i18nKey = `billing.errorCodes.${code}`;
    const translatedMsg = t(i18nKey);
    return translatedMsg !== i18nKey ? translatedMsg : fallback;
  };

  const handleCheckout = async (confirmScheduleConflict = false) => {
    try {
      const subtotal = classData.unitPrice * learners.length;
      const expectedTotalDiscountVnd = selectedVouchers.reduce(
        (sum, v) => sum + calculateVoucherDiscount(v, subtotal),
        0,
      );

      const result = await checkout({
        paymentType: "ClassEnrollment",
        classId: Number(classId),
        voucherIds: selectedVouchers.map((v) => Number(v.voucherId || v.id)),
        learnerAccountIds: learners
          .filter((l) => !l.isPayer)
          .map((l) => Number(l.id)),
        expectedTotalDiscountVnd,
        confirmScheduleConflict,
        pendingClassData: "",
        returnUrl: `${window.location.origin}/workspace/learning/class/${classId}`,
        cancelUrl: window.location.origin + window.location.pathname,
        planId: 0,
      }).unwrap();

      const resultPayload =
        result &&
        typeof result === "object" &&
        !Array.isArray(result) &&
        Object.prototype.hasOwnProperty.call(result, "data")
          ? result.data
          : result;

      if (resultPayload?.checkoutUrl) {
        const checkoutUrl = getSafeMediaUrl(resultPayload.checkoutUrl);
        if (!checkoutUrl) throw new Error("Invalid checkout URL");
        toast.success(
          tc.redirecting || "Đang chuyển hướng đến trang thanh toán...",
        );
        window.location.assign(checkoutUrl);
      } else {
        toast.success(tc.paymentSuccess);
        navigate(`/workspace/learning/class/${classId}`);
      }
    } catch (error) {
      const status = error?.status ?? error?.originalStatus;
      const responseData = error?.data?.data || error?.data || {};
      const errorCode = responseData.errorCode;
      const errMsg = responseData.message || error?.error || tc.paymentError;

      if (
        status === 409 ||
        errorCode === "CLASS_ENROLLMENT_SCHEDULE_CONFLICT"
      ) {
        const names =
          responseData.conflictingClassNames ||
          (errMsg.match(/Lịch học trùng với lớp: (.+)/) || [])[1]
            ?.split(", ")
            .filter(Boolean) ||
          [];
        setConflictClasses({ names });
        return;
      }

      if (errorCode === "PAYMENT_VOUCHER_UNAVAILABLE") {
        const codeMatch = errMsg.match(/CODE:([^|]+)/);
        const voucherCode = codeMatch ? codeMatch[1] : "";

        if (voucherCode) {
          setSelectedVouchers((prev) =>
            prev.filter((v) => v.code !== voucherCode),
          );
          const localizedMsg = getErrorMessage(
            errorCode,
            tc.voucherUnavailable,
          );
          toast.error(localizedMsg.replace("{{code}}", voucherCode));
        } else {
          toast.error(getErrorMessage(errorCode, errMsg));
        }
      } else if (errorCode === "PAYMENT_VOUCHER_DISCOUNT_CHANGED") {
        toast.error(getErrorMessage(errorCode, errMsg));
        refetchVouchers();
      } else {
        toast.error(getErrorMessage(errorCode, errMsg));
      }
    }
  };

  if (isLoadingClass) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B20000]" />
      </div>
    );
  }

  if (classError && !classDetail) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow">
          <h2 className="text-xl font-bold text-[#B20000] mb-2">
            {tc.classNotFound}
          </h2>
          <p className="text-gray-600 mb-4">{tc.classNotFoundDesc}</p>
          <Link to="/" className="text-[#1864AB] font-semibold hover:underline">
            {tc.backToHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <div className="p-4 md:p-6 space-y-6">
        <Breadcrumb
          className="flex-wrap"
          items={[
            { label: tc.breadcrumbHome, onClick: () => navigate("/") },
            {
              label: tc.breadcrumbExplore,
              onClick: () => navigate("/explore-courses"),
            },
            // { label: tc.breadcrumbCourseDetail, onClick: () => navigate(`/explore-courses/details/${course.id}`) },
            {
              label: tc.breadcrumbClassDetail,
              onClick: () => navigate(`/explore-courses/class/${classId}`),
            },
            { label: tc.breadcrumbCheckout },
          ]}
        />

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
              friendsList={friendsList}
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
              onRemoveVoucher={(id) =>
                setSelectedVouchers(selectedVouchers.filter((v) => v.id !== id))
              }
              onOpenModal={() => setIsVoucherModalOpen(true)}
              onCheckout={handleCheckout}
              isProcessing={isCheckoutLoading}
              isVoucherLoading={isLoadingVouchers || isFetchingVouchers}
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

      <ConfirmationModal
        open={!!conflictClasses}
        onClose={() => setConflictClasses(null)}
        onConfirm={() => {
          setConflictClasses(null);
          handleCheckout(true);
        }}
        title={
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={22} className="text-amber-500 shrink-0" />
            <span className="text-lg font-black text-gray-950">
              {tc.scheduleConflictTitle || "Lịch học bị trùng"}
            </span>
          </div>
        }
        cancelText={tc.cancel || "Hủy"}
        confirmText={tc.confirmEnroll || "Vẫn đăng ký"}
        confirmVariant="primary"
      >
        <div className="flex flex-col gap-4 mt-2">
          <p className="text-sm text-gray-600 font-medium leading-relaxed">
            {tc.scheduleConflictDesc ||
              "Lịch học của lớp này trùng với lớp bạn đang học:"}
          </p>
          {(conflictClasses?.names || []).length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {conflictClasses.names.map((name) => (
                <li
                  key={name}
                  className="text-sm font-bold text-[#b20a1c] bg-rose-50 border border-rose-100 rounded-xl px-3 py-2"
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default CheckoutClassPage;
