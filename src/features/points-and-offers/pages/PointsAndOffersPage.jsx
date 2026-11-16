import React, { useState } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Tabs, { TabContent } from "@/shared/components/ui/navigation/Tabs"
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

const PointsAndOffersPage = () => {
  const { t } = useLanguage()
  const pt = t.pointsAndOffers || {}

  const tabs = [
    { id: TAB_KEYS.OVERVIEW, label: pt.tabs?.overview || "Tổng quan" },
    { id: TAB_KEYS.EXCHANGE, label: pt.tabs?.exchange || "Đổi Voucher" },
    { id: TAB_KEYS.VAULT, label: pt.tabs?.vault || "Kho Voucher" },
    { id: TAB_KEYS.HISTORY, label: pt.tabs?.history || "Lịch sử điểm" },
  ]

  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab)
  }
  const {
    activeTab,
    setActiveTab,
    userPoints,
    earningMethods,
    recentActivities,
    vouchers,
    redeemablePreviewVouchers,
    vaultVouchers,
    vaultCounts,
    pointHistory,
    modalStep,
    selectedVoucher,
    newlyRedeemedVoucher,
    isProcessingExchange,
    technicalErrorCode,
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
    historyPage,
    setHistoryPage,
    historyPageSize,
    exchangeSearchQuery,
    setExchangeSearchQuery,
    exchangeCategoryFilter,
    setExchangeCategoryFilter,
    exchangeTypeFilter,
    setExchangeTypeFilter,
    isLoadingOverview,
    isFetchingOverview,
    isLoadingTemplates,
    isFetchingTemplates,
    isLoadingInventory,
    isFetchingInventory,
    isLoadingHistory,
    isFetchingHistory,
  } = usePointsAndOffers()

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
      {/* Page Title & Subtitle */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {pt.pageTitle || "Quản lý Điểm thưởng và Ưu đãi"}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-1">
          {pt.pageSubtitle || "Theo dõi số dư điểm thưởng, tích lũy điểm và đổi lấy các voucher học tập giá trị."}
        </p>
      </div>

      {/* Hero Points Banner */}
      <PointsBanner
        availablePoints={userPoints.availablePoints}
        expiringPoints={userPoints.expiringPoints}
        expiryDate={userPoints.expiryDate}
        onRedeemClick={() => setActiveTab(TAB_KEYS.EXCHANGE)}
        isLoading={isLoadingOverview || isFetchingOverview}
      />

      {/* Main Tab Navigation Bar */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        fullWidth={false}
        className="mb-6"
      />

      {/* Tab Content Panes */}
      <TabContent
        activeTab={activeTab}
        tabs={tabs}
        className="w-full"
      >
        {activeTab === TAB_KEYS.OVERVIEW && (
          <PointsOverviewTab
            userPoints={userPoints}
            earningMethods={earningMethods}
            pointHistory={recentActivities}
            redeemableVouchers={redeemablePreviewVouchers}
            onNavigateTab={setActiveTab}
            onRedeemVoucher={handleOpenExchangeModal}
            isLoading={
              isLoadingOverview ||
              isFetchingOverview ||
              isLoadingTemplates ||
              isFetchingTemplates
            }
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
            typeFilter={exchangeTypeFilter}
            onTypeChange={setExchangeTypeFilter}
            onRedeemVoucher={handleOpenExchangeModal}
            isLoading={isLoadingTemplates || isFetchingTemplates}
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
            isLoading={isLoadingInventory || isFetchingInventory}
          />
        )}

        {activeTab === TAB_KEYS.HISTORY && (
          <PointsHistoryTab
            pointHistory={pointHistory}
            historyFilter={historyFilter}
            onFilterChange={setHistoryFilter}
            historyPage={historyPage}
            onPageChange={setHistoryPage}
            historyPageSize={historyPageSize}
            isLoading={isLoadingHistory || isFetchingHistory}
          />
        )}
      </TabContent>

      {/* Modals Flow */}
      <ExchangeConfirmModal
        isOpen={modalStep === MODAL_STEPS.CONFIRM}
        voucher={selectedVoucher}
        availablePoints={userPoints.availablePoints}
        onClose={handleCloseModal}
        onConfirm={handleConfirmExchange}
        isProcessing={isProcessingExchange}
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
        errorCode={technicalErrorCode}
        onClose={handleCloseModal}
        onRetry={() => handleConfirmExchange()}
        onChooseAnother={() => {
          handleCloseModal()
          setActiveTab(TAB_KEYS.EXCHANGE)
        }}
      />
    </div>
  )
}

export default PointsAndOffersPage
