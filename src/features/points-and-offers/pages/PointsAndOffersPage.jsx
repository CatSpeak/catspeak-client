import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  usePointsAndOffers,
  TAB_KEYS,
  MODAL_STEPS,
} from "../hooks/usePointsAndOffers"
import PointsBanner from "../components/PointsBanner"
import PointsOverviewTab from "../components/PointsOverviewTab"
import VoucherExchangeTab from "../components/VoucherExchangeTab"
import VoucherVaultTab from "../components/VoucherVaultTab"
import PointsHistoryTab from "../components/PointsHistoryTab"
import ExchangeConfirmModal from "../components/modals/ExchangeConfirmModal"
import ExchangeProcessingModal from "../components/modals/ExchangeProcessingModal"
import ExchangeSuccessModal from "../components/modals/ExchangeSuccessModal"
import ExchangeErrorModal from "../components/modals/ExchangeErrorModal"

const TABS = [
  { key: TAB_KEYS.OVERVIEW, label: "Tổng quan" },
  { key: TAB_KEYS.EXCHANGE, label: "Đổi Voucher" },
  { key: TAB_KEYS.VAULT, label: "Kho Voucher" },
  { key: TAB_KEYS.HISTORY, label: "Lịch sử điểm" },
]

const PointsAndOffersPage = () => {
  const {
    activeTab,
    setActiveTab,
    userPoints,
    earningMethods,
    vouchers,
    redeemablePreviewVouchers,
    vaultVouchers,
    vaultCounts,
    pointHistory,
    modalStep,
    selectedVoucher,
    newlyRedeemedVoucher,
    simulationMode,
    setSimulationMode,
    handleOpenExchangeModal,
    handleConfirmExchange,
    handleCloseModal,
    handleGoToVault,
    handleCopyCode,
    handleUseVoucher,
    vaultSubTab,
    setVaultSubTab,
    historyFilter,
    setHistoryFilter,
    exchangeSearchQuery,
    setExchangeSearchQuery,
    exchangeCategoryFilter,
    setExchangeCategoryFilter,
    isEmptyHistoryPreview,
    setIsEmptyHistoryPreview,
  } = usePointsAndOffers()

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
      {/* Page Title & Subtitle */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Quản lý Điểm thưởng và Ưu đãi
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Theo dõi và sử dụng điểm thưởng đã tích lũy và voucher.
        </p>
      </div>

      {/* Hero Points Banner */}
      <PointsBanner
        availablePoints={
          isEmptyHistoryPreview ? 0 : userPoints.availablePoints
        }
        expiringPoints={
          isEmptyHistoryPreview ? 0 : userPoints.expiringPoints
        }
        expiryDate={userPoints.expiryDate}
        onRedeemClick={() => setActiveTab(TAB_KEYS.EXCHANGE)}
      />

      {/* Main Tab Navigation Bar */}
      <div className="border-b border-gray-200/90 mb-6 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-6 sm:gap-8 min-w-max">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative pb-3 text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? "text-[#990011]"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#990011]"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content Panes */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === TAB_KEYS.OVERVIEW && (
            <PointsOverviewTab
              userPoints={userPoints}
              earningMethods={earningMethods}
              pointHistory={pointHistory}
              redeemableVouchers={redeemablePreviewVouchers}
              onNavigateTab={setActiveTab}
              onRedeemVoucher={handleOpenExchangeModal}
            />
          )}

          {activeTab === TAB_KEYS.EXCHANGE && (
            <VoucherExchangeTab
              vouchers={vouchers}
              userPoints={userPoints.availablePoints}
              searchQuery={exchangeSearchQuery}
              onSearchChange={setExchangeSearchQuery}
              categoryFilter={exchangeCategoryFilter}
              onCategoryChange={setExchangeCategoryFilter}
              onRedeemVoucher={handleOpenExchangeModal}
            />
          )}

          {activeTab === TAB_KEYS.VAULT && (
            <VoucherVaultTab
              vaultVouchers={vaultVouchers}
              vaultCounts={vaultCounts}
              activeSubTab={vaultSubTab}
              onSubTabChange={setVaultSubTab}
              onCopyCode={handleCopyCode}
              onUseNow={handleUseVoucher}
              onGoToExchange={() => setActiveTab(TAB_KEYS.EXCHANGE)}
            />
          )}

          {activeTab === TAB_KEYS.HISTORY && (
            <PointsHistoryTab
              pointHistory={pointHistory}
              historyFilter={historyFilter}
              onFilterChange={setHistoryFilter}
              isEmptyPreview={isEmptyHistoryPreview}
              onToggleEmptyPreview={() =>
                setIsEmptyHistoryPreview((prev) => !prev)
              }
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals Flow */}
      <ExchangeConfirmModal
        isOpen={modalStep === MODAL_STEPS.CONFIRM}
        voucher={selectedVoucher}
        availablePoints={userPoints.availablePoints}
        onClose={handleCloseModal}
        onConfirm={handleConfirmExchange}
        simulationMode={simulationMode}
        setSimulationMode={setSimulationMode}
      />

      <ExchangeProcessingModal
        isOpen={modalStep === MODAL_STEPS.PROCESSING}
      />

      <ExchangeSuccessModal
        isOpen={modalStep === MODAL_STEPS.SUCCESS}
        voucher={newlyRedeemedVoucher || selectedVoucher}
        onClose={handleCloseModal}
        onViewVault={handleGoToVault}
        onCopyCode={handleCopyCode}
      />

      <ExchangeErrorModal
        isOpen={
          modalStep === MODAL_STEPS.ERROR_NETWORK ||
          modalStep === MODAL_STEPS.ERROR_OUT_OF_STOCK
        }
        errorType={
          modalStep === MODAL_STEPS.ERROR_NETWORK ? "network" : "out_of_stock"
        }
        onClose={handleCloseModal}
        onRetry={() => handleConfirmExchange("success")}
        onChooseAnother={() => {
          handleCloseModal()
          setActiveTab(TAB_KEYS.EXCHANGE)
        }}
      />
    </div>
  )
}

export default PointsAndOffersPage
