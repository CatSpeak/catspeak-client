import React from "react"
import {
  Star,
  ArrowLeftRight,
  Clock,
  ArrowRight,
  UserPlus,
  Trophy,
  Ticket,
  GraduationCap,
  Sparkles,
} from "lucide-react"
import VoucherCardItem from "./VoucherCardItem"

const PointsOverviewTab = ({
  userPoints,
  earningMethods = [],
  pointHistory = [],
  redeemableVouchers = [],
  onNavigateTab,
  onRedeemVoucher,
}) => {
  const recentActivities = pointHistory.slice(0, 3)

  return (
    <div className="space-y-8 pb-10">
      {/* 3 Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Tổng điểm đã tích lũy */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
            <Star size={24} className="fill-amber-400 text-amber-500" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium block">
              Tổng điểm đã tích lũy
            </span>
            <div className="text-xl font-bold text-gray-900 mt-0.5">
              {(userPoints.totalAccumulated || 400).toLocaleString("vi-VN")} điểm
            </div>
          </div>
        </div>

        {/* Card 2: Đã đổi */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
            <ArrowLeftRight size={22} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium block">
              Đã đổi
            </span>
            <div className="text-xl font-bold text-gray-900 mt-0.5">
              {(userPoints.totalRedeemed || 50).toLocaleString("vi-VN")} điểm
            </div>
          </div>
        </div>

        {/* Card 3: Sắp hết hạn */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium block">
              Sắp hết hạn
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-amber-600">
                {(userPoints.expiringPoints || 50).toLocaleString("vi-VN")} điểm
              </span>
              <span className="text-xs text-gray-400 font-normal">
                trước {userPoints.expiringBefore || "20/09/2026"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* "Cách nhận điểm" Section */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-4">
          Cách nhận điểm
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {earningMethods.map((method) => {
            let IconComponent = Star
            let iconBg = "bg-[#990011]"
            if (method.icon === "user-plus") {
              IconComponent = UserPlus
              iconBg = "bg-blue-600"
            } else if (method.icon === "trophy") {
              IconComponent = Trophy
              iconBg = "bg-amber-500"
            }

            return (
              <div
                key={method.id}
                className="bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 text-center shadow-xs flex flex-col items-center justify-between"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full ${iconBg} text-white flex items-center justify-center shadow-sm mb-3`}
                  >
                    <IconComponent size={22} />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">
                    {method.title}
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    {method.subtitle}
                  </p>
                </div>

                <span className="inline-block text-xs font-semibold text-[#990011] bg-rose-50 border border-rose-200/90 px-3 py-1 rounded-full">
                  +{method.points} pts
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* "Hoạt động gần đây" Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900">
            Hoạt động gần đây
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab("history")}
            className="text-xs font-semibold text-[#990011] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Xem tất cả</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="bg-white border border-gray-200/90 rounded-2xl divide-y divide-gray-100 shadow-xs overflow-hidden">
          {recentActivities.map((act) => {
            const isSpend = act.type === "spend" || act.points < 0
            return (
              <div
                key={act.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isSpend
                        ? "bg-rose-50 text-rose-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {isSpend ? (
                      <Ticket size={20} />
                    ) : act.icon === "cap" ? (
                      <GraduationCap size={20} />
                    ) : (
                      <Star size={20} />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">
                      {act.title}
                    </h5>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {act.date}
                    </p>
                  </div>
                </div>

                <div
                  className={`text-sm font-bold flex items-center gap-1 shrink-0 ${
                    isSpend ? "text-[#990011]" : "text-amber-500"
                  }`}
                >
                  <span>{act.points > 0 ? `+${act.points}` : act.points}</span>
                  <Star
                    size={14}
                    className={isSpend ? "fill-[#990011] text-[#990011]" : "fill-amber-500 text-amber-500"}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* "Có thể đổi ngay" Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">
              Có thể đổi ngay
            </h3>
            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
              <span>{userPoints.availablePoints}</span>
              <Star size={12} className="fill-amber-500 text-amber-500" />
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab("exchange")}
            className="text-xs font-semibold text-[#990011] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Xem tất cả</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {redeemableVouchers.map((voucher) => (
            <VoucherCardItem
              key={voucher.id}
              voucher={voucher}
              userPoints={userPoints.availablePoints}
              onRedeem={onRedeemVoucher}
              compact
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PointsOverviewTab
