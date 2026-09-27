import { useState, useMemo, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"
import {
  INITIAL_USER_POINTS,
  AVAILABLE_VOUCHERS,
  INITIAL_VAULT_VOUCHERS,
  INITIAL_POINT_HISTORY,
  EARNING_METHODS,
} from "../constants/mockData"

export const TAB_KEYS = {
  OVERVIEW: "overview",
  EXCHANGE: "exchange",
  VAULT: "vault",
  HISTORY: "history",
}

export const MODAL_STEPS = {
  NONE: null,
  CONFIRM: "confirm",
  PROCESSING: "processing",
  SUCCESS: "success",
  ERROR_NETWORK: "error_network",
  ERROR_OUT_OF_STOCK: "error_out_of_stock",
}

export const usePointsAndOffers = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Tab state synced with search param `?tab=...`
  const activeTab = searchParams.get("tab") || TAB_KEYS.OVERVIEW

  const setActiveTab = useCallback(
    (tabKey) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set("tab", tabKey)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  // Core domain states
  const [userPoints, setUserPoints] = useState(INITIAL_USER_POINTS)
  const [vouchers, setVouchers] = useState(AVAILABLE_VOUCHERS)
  const [vaultVouchers, setVaultVouchers] = useState(INITIAL_VAULT_VOUCHERS)
  const [pointHistory, setPointHistory] = useState(INITIAL_POINT_HISTORY)

  // Modal & Exchange workflow states
  const [selectedVoucher, setSelectedVoucher] = useState(null)
  const [modalStep, setModalStep] = useState(MODAL_STEPS.NONE)
  const [simulationMode, setSimulationMode] = useState("success") // "success" | "error_network" | "error_out_of_stock"
  const [newlyRedeemedVoucher, setNewlyRedeemedVoucher] = useState(null)

  // Filters
  const [vaultSubTab, setVaultSubTab] = useState("unused") // "unused" | "used" | "expired"
  const [historyFilter, setHistoryFilter] = useState("all") // "all" | "earn" | "spend"
  const [exchangeSearchQuery, setExchangeSearchQuery] = useState("")
  const [exchangeCategoryFilter, setExchangeCategoryFilter] = useState("all")
  const [isEmptyHistoryPreview, setIsEmptyHistoryPreview] = useState(false)

  // Computed Vault Counts
  const vaultCounts = useMemo(() => {
    return {
      unused: vaultVouchers.filter((v) => v.status === "unused").length,
      used: vaultVouchers.filter((v) => v.status === "used").length,
      expired: vaultVouchers.filter((v) => v.status === "expired").length,
    }
  }, [vaultVouchers])

  // Filtered Vault list
  const filteredVaultVouchers = useMemo(() => {
    return vaultVouchers.filter((item) => item.status === vaultSubTab)
  }, [vaultVouchers, vaultSubTab])

  // Filtered History list
  const filteredHistory = useMemo(() => {
    if (isEmptyHistoryPreview) return []
    if (historyFilter === "earn") {
      return pointHistory.filter((item) => item.type === "earn")
    }
    if (historyFilter === "spend") {
      return pointHistory.filter((item) => item.type === "spend")
    }
    return pointHistory
  }, [pointHistory, historyFilter, isEmptyHistoryPreview])

  // Filtered Exchange Vouchers
  const filteredExchangeVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const matchSearch =
        v.title.toLowerCase().includes(exchangeSearchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(exchangeSearchQuery.toLowerCase())
      const matchCategory =
        exchangeCategoryFilter === "all" || v.category === exchangeCategoryFilter
      return matchSearch && matchCategory
    })
  }, [vouchers, exchangeSearchQuery, exchangeCategoryFilter])

  // Voucher preview for Overview tab (redeemable immediately)
  const redeemablePreviewVouchers = useMemo(() => {
    return vouchers
      .filter((v) => v.status === "available" && v.pointsRequired <= userPoints.availablePoints)
      .slice(0, 2)
  }, [vouchers, userPoints.availablePoints])

  // Actions
  const handleOpenExchangeModal = useCallback(
    (voucher) => {
      if (voucher.status === "out_of_stock") {
        toast.error("Voucher này đã hết lượt đổi!")
        return
      }
      if (voucher.pointsRequired > userPoints.availablePoints) {
        toast.error(`Bạn cần thêm ${voucher.pointsRequired - userPoints.availablePoints} điểm để đổi voucher này!`)
        return
      }
      setSelectedVoucher(voucher)
      setModalStep(MODAL_STEPS.CONFIRM)
    },
    [userPoints.availablePoints],
  )

  const handleCloseModal = useCallback(() => {
    setModalStep(MODAL_STEPS.NONE)
    setSelectedVoucher(null)
  }, [])

  const handleConfirmExchange = useCallback(
    (forcedOutcome = null) => {
      const outcome = forcedOutcome || simulationMode
      setModalStep(MODAL_STEPS.PROCESSING)

      setTimeout(() => {
        if (outcome === "error_network") {
          setModalStep(MODAL_STEPS.ERROR_NETWORK)
          return
        }
        if (outcome === "error_out_of_stock") {
          setModalStep(MODAL_STEPS.ERROR_OUT_OF_STOCK)
          return
        }

        // Success flow: deduct points, generate code, add to vault & history
        if (!selectedVoucher) return

        const cost = selectedVoucher.pointsRequired
        setUserPoints((prev) => ({
          ...prev,
          availablePoints: Math.max(0, prev.availablePoints - cost),
          totalRedeemed: prev.totalRedeemed + cost,
        }))

        const randomCode = `CAT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
        const newVoucherItem = {
          id: `vault-${Date.now()}`,
          code: randomCode,
          title: selectedVoucher.title,
          discountTag: selectedVoucher.badge,
          status: "unused",
          expiryDate: selectedVoucher.expiryDate,
          badge: "Chưa dùng",
          description: selectedVoucher.description,
          createdAt: new Date().toLocaleDateString("vi-VN"),
        }

        setVaultVouchers((prev) => [newVoucherItem, ...prev])
        setNewlyRedeemedVoucher(newVoucherItem)

        // Add history entry
        const now = new Date()
        const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
        setPointHistory((prev) => [
          {
            id: `tx-${Date.now()}`,
            title: `Đổi ${selectedVoucher.title}`,
            subtitle: `Sử dụng điểm đổi mã ${randomCode}`,
            date: formattedDate,
            points: -cost,
            type: "spend",
            icon: "exchange",
          },
          ...prev,
        ])

        // Update percent redeemed in catalog
        setVouchers((prev) =>
          prev.map((v) =>
            v.id === selectedVoucher.id
              ? { ...v, percentRedeemed: Math.min(100, v.percentRedeemed + 2) }
              : v,
          ),
        )

        setModalStep(MODAL_STEPS.SUCCESS)
        toast.success("Đổi voucher thành công!")
      }, 1000)
    },
    [simulationMode, selectedVoucher],
  )

  const handleCopyCode = useCallback((code) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code)
      toast.success(`Đã sao chép mã ${code}!`)
    } else {
      toast.success(`Mã: ${code}`)
    }
  }, [])

  const handleGoToVault = useCallback(() => {
    handleCloseModal()
    setActiveTab(TAB_KEYS.VAULT)
    setVaultSubTab("unused")
  }, [handleCloseModal, setActiveTab])

  const handleUseVoucher = useCallback((voucher) => {
    toast.success(`Đã áp dụng mã ${voucher.code} cho khóa học!`)
  }, [])

  return {
    // Navigation / Tabs
    activeTab,
    setActiveTab,
    TAB_KEYS,

    // Core Data
    userPoints,
    earningMethods: EARNING_METHODS,
    vouchers: filteredExchangeVouchers,
    redeemablePreviewVouchers,
    vaultVouchers: filteredVaultVouchers,
    vaultCounts,
    pointHistory: filteredHistory,

    // Modal state & actions
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

    // Filters
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
  }
}
