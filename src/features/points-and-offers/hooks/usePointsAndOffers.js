import { useState, useMemo, useCallback, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"
import { selectCurrentUser } from "@/store/slices/authSlice"
import {
  useGetPointsOverviewQuery,
  useGetPointsHistoryQuery,
  useGetVoucherTemplatesQuery,
  useGetVoucherInventoryQuery,
  useRedeemVoucherMutation,
} from "../api/pointApi"
import { EARNING_METHODS } from "../constants/mockData"

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

/** Format ISO datetime to "DD/MM/YYYY HH:mm" */
export const formatDateTime = (isoString) => {
  if (!isoString) return ""
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")
    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch {
    return isoString
  }
}

/** Format ISO datetime to "DD/MM/YYYY" */
export const formatDateOnly = (isoString) => {
  if (!isoString) return ""
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return isoString
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const usePointsAndOffers = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentUser = useSelector(selectCurrentUser)

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

  // Filters and Pagination
  const [vaultSubTab, setVaultSubTab] = useState("unused") // "unused" | "used" | "expired"
  const [vaultCounts, setVaultCounts] = useState({
    unused: undefined,
    used: undefined,
    expired: undefined,
  })
  const [historyFilter, setHistoryFilter] = useState("all") // "all" | "earn" | "spend"
  const [historyPage, setHistoryPage] = useState(1)
  const historyPageSize = 10
  const [exchangeSearchQuery, setExchangeSearchQuery] = useState("")
  const [exchangeCategoryFilter, setExchangeCategoryFilter] = useState("all")

  // Modal & Exchange workflow states
  const [selectedVoucher, setSelectedVoucher] = useState(null)
  const [modalStep, setModalStep] = useState(MODAL_STEPS.NONE)
  const [newlyRedeemedVoucher, setNewlyRedeemedVoucher] = useState(null)
  const [isProcessingExchange, setIsProcessingExchange] = useState(false)
  const [technicalErrorCode, setTechnicalErrorCode] = useState(null)

  // ─── RTK Query API Hooks ───────────────────────────────────────────
  const {
    data: overviewData,
    isLoading: isLoadingOverviewQuery,
    isFetching: isFetchingOverview,
    refetch: refetchOverview,
  } = useGetPointsOverviewQuery()

  const {
    data: historyData = [],
    isLoading: isLoadingHistoryQuery,
    isFetching: isFetchingHistory,
    refetch: refetchHistory,
  } = useGetPointsHistoryQuery(
    {
      page: historyPage,
      pageSize: historyPageSize,
      type: historyFilter !== "all" ? historyFilter : undefined,
    },
    { refetchOnMountOrArgChange: true }
  )

  const {
    data: templatesData = [],
    isLoading: isLoadingTemplatesQuery,
    isFetching: isFetchingTemplates,
    refetch: refetchTemplates,
  } = useGetVoucherTemplatesQuery(
    {
      category: exchangeCategoryFilter !== "all" ? exchangeCategoryFilter : undefined,
      search: exchangeSearchQuery?.trim() || undefined,
    },
    { refetchOnMountOrArgChange: true }
  )

  // Format inventory status query param dynamically on filter change
  const inventoryStatusParam = useMemo(() => {
    if (!vaultSubTab || vaultSubTab === "all") return undefined
    return vaultSubTab.charAt(0).toUpperCase() + vaultSubTab.slice(1).toLowerCase()
  }, [vaultSubTab])

  const {
    data: inventoryData = [],
    isLoading: isLoadingInventoryQuery,
    isFetching: isFetchingInventory,
    refetch: refetchInventory,
  } = useGetVoucherInventoryQuery(
    { status: inventoryStatusParam },
    { refetchOnMountOrArgChange: true }
  )

  // Update vault count for active sub-tab upon fetch
  useEffect(() => {
    if (Array.isArray(inventoryData)) {
      const key = (vaultSubTab || "unused").toLowerCase()
      setVaultCounts((prev) => ({
        ...prev,
        [key]: inventoryData.length,
      }))
    }
  }, [inventoryData, vaultSubTab])

  const [redeemVoucherMutation] = useRedeemVoucherMutation()

  // ─── Computed Domain States ────────────────────────────────────────
  const userPoints = useMemo(() => {
    return {
      availablePoints: overviewData?.balance ?? 0,
      expiringPoints: overviewData?.expiringSoon ?? 0,
      expiryDate: "trong 30 ngày tới",
      totalAccumulated: overviewData?.totalEarned ?? 0,
      totalRedeemed: overviewData?.totalRedeemed ?? 0,
    }
  }, [overviewData])

  // Overview recent activities
  const recentActivities = useMemo(() => {
    const raw = overviewData?.recentActivities
    if (!Array.isArray(raw)) return []
    return raw.map((item, idx) => ({
      id: item.transactionId || `recent-${idx}`,
      transactionId: item.transactionId,
      title: item.sourceDescription || (item.type === "Earn" ? "Tích lũy điểm" : "Sử dụng điểm"),
      subtitle:
        item.type === "Earn"
          ? "Tích lũy hoàn tất"
          : item.type === "Redeem"
            ? "Đổi voucher"
            : "Điểm hết hạn",
      date: formatDateTime(item.createdAt),
      createdAt: item.createdAt,
      points: item.amount ?? (item.type === "Earn" ? 50 : -50),
      type: (item.type || "Earn").toLowerCase(),
      icon: item.type === "Earn" ? "star" : "exchange",
    }))
  }, [overviewData?.recentActivities])

  // Formatted & Filtered Voucher Templates
  const formattedTemplates = useMemo(() => {
    if (!Array.isArray(templatesData)) return []
    return templatesData.map((tpl) => {
      const isPercentage = tpl.discountType === "Percentage"
      const badge = isPercentage
        ? `Giảm ${tpl.discountValue}%`
        : `Giảm ${tpl.discountValue >= 1000 ? `${tpl.discountValue / 1000}k` : `${tpl.discountValue}đ`}`

      return {
        id: tpl.templateId,
        templateId: tpl.templateId,
        title: tpl.name,
        name: tpl.name,
        badge,
        discountType: tpl.discountType,
        discountValue: tpl.discountValue,
        description: tpl.conditions || "Áp dụng khi thanh toán khóa học/lớp học",
        conditions: tpl.conditions,
        expiryDate: tpl.validityDays ? `Hạn ${tpl.validityDays} ngày` : "30 ngày",
        validityDays: tpl.validityDays,
        pointsRequired: tpl.pointsRequired || 0,
        stock: tpl.stock ?? 0,
        isRedeemable: !!tpl.isRedeemable,
        notRedeemableReason: tpl.notRedeemableReason || null,
        status: tpl.stock <= 0 ? "out_of_stock" : tpl.isRedeemable ? "available" : "unavailable",
        category: "course",
      }
    })
  }, [templatesData])

  const filteredExchangeVouchers = useMemo(() => {
    return formattedTemplates.filter((v) => {
      const matchSearch =
        v.title.toLowerCase().includes(exchangeSearchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(exchangeSearchQuery.toLowerCase())
      const matchCategory =
        exchangeCategoryFilter === "all" || v.category === exchangeCategoryFilter
      return matchSearch && matchCategory
    })
  }, [formattedTemplates, exchangeSearchQuery, exchangeCategoryFilter])

  const redeemablePreviewVouchers = useMemo(() => {
    return formattedTemplates
      .filter((v) => v.isRedeemable)
      .slice(0, 2)
  }, [formattedTemplates])

  // Formatted Vault Inventory
  const transformInventoryItem = useCallback((item) => {
    const isPercentage = item.discountType === "Percentage"
    const discountTag = isPercentage
      ? `${item.discountValue}%`
      : item.discountValue >= 1000
        ? `${item.discountValue / 1000}k`
        : `${item.discountValue}đ`

    const statusLower = (item.status || "Unused").toLowerCase()
    return {
      id: item.voucherId || `inv-${item.code}`,
      voucherId: item.voucherId,
      code: item.code,
      title: item.name,
      name: item.name,
      discountTag,
      discountType: item.discountType,
      discountValue: item.discountValue,
      status: statusLower,
      expiryDate: formatDateOnly(item.expiresAt),
      expiresAt: item.expiresAt,
      usedDate: item.redeemedAt ? formatDateTime(item.redeemedAt) : null,
      redeemedAt: item.redeemedAt,
      badge: statusLower === "unused" ? "Chưa dùng" : statusLower === "used" ? "Đã dùng" : "Hết hạn",
      description:
        item.discountType === "Percentage"
          ? `Giảm ${item.discountValue}% học phí khi thanh toán`
          : `Trừ trực tiếp ${(item.discountValue || 0).toLocaleString("vi-VN")} đ vào hóa đơn`,
    }
  }, [])

  const filteredVaultVouchers = useMemo(() => {
    if (!Array.isArray(inventoryData)) return []
    return inventoryData.map(transformInventoryItem)
  }, [inventoryData, transformInventoryItem])

  // Formatted History List
  const formattedHistory = useMemo(() => {
    if (!Array.isArray(historyData)) return []
    return historyData.map((item, idx) => {
      const typeLower = (item.type || "Earn").toLowerCase()
      const isSpend = typeLower === "redeem" || typeLower === "expire" || (item.amount || 0) < 0
      return {
        id: item.transactionId || `tx-${idx}`,
        transactionId: item.transactionId,
        title: item.sourceDescription || (typeLower === "earn" ? "Tích lũy điểm" : "Sử dụng điểm"),
        subtitle:
          typeLower === "earn"
            ? "Tích lũy hoàn tất"
            : typeLower === "redeem"
              ? "Sử dụng điểm đổi voucher"
              : "Điểm thưởng hết hạn",
        date: formatDateTime(item.createdAt),
        createdAt: item.createdAt,
        points: item.amount || 0,
        type: isSpend ? "spend" : "earn",
        rawType: item.type,
        icon: typeLower === "earn" ? "check" : "exchange",
      }
    })
  }, [historyData])

  const filteredHistory = useMemo(() => {
    if (historyFilter === "earn") {
      return formattedHistory.filter((item) => item.type === "earn" || item.points > 0)
    }
    if (historyFilter === "spend") {
      return formattedHistory.filter((item) => item.type === "spend" || item.points < 0)
    }
    return formattedHistory
  }, [formattedHistory, historyFilter])

  // ─── User Actions & Flow ───────────────────────────────────────────
  const handleOpenExchangeModal = useCallback(
    (voucher) => {
      if (voucher.isRedeemable === false && voucher.notRedeemableReason) {
        toast.error(voucher.notRedeemableReason)
        return
      }
      if (voucher.status === "out_of_stock" || voucher.stock <= 0) {
        toast.error("Voucher này đã hết lượt đổi!")
        return
      }
      if (voucher.pointsRequired > (overviewData?.balance ?? 0)) {
        toast.error(
          `Bạn cần thêm ${voucher.pointsRequired - (overviewData?.balance ?? 0)} điểm để đổi voucher này!`,
        )
        return
      }
      setSelectedVoucher(voucher)
      setTechnicalErrorCode(null)
      setModalStep(MODAL_STEPS.CONFIRM)
    },
    [overviewData?.balance],
  )

  const handleCloseModal = useCallback(() => {
    if (isProcessingExchange) return // Lock modal while in-flight
    setModalStep(MODAL_STEPS.NONE)
    setSelectedVoucher(null)
  }, [isProcessingExchange])

  /**
   * Redeem Voucher with auto-retry (up to 3 attempts, 2s interval)
   * and fallback technical error code display `ERR-{Timestamp}-{UserId}`
   */
  const handleConfirmExchange = useCallback(async () => {
    if (!selectedVoucher || isProcessingExchange) return

    const templateId = selectedVoucher.templateId || selectedVoucher.id
    setModalStep(MODAL_STEPS.PROCESSING)
    setIsProcessingExchange(true)
    setTechnicalErrorCode(null)

    const maxRetries = 3
    let attempt = 0
    let isSuccessful = false
    let lastError = null

    while (attempt < maxRetries && !isSuccessful) {
      attempt += 1
      try {
        const response = await redeemVoucherMutation(templateId).unwrap()
        isSuccessful = true

        const newVoucher = {
          id: response?.voucherId || `vault-${Date.now()}`,
          voucherId: response?.voucherId,
          code: response?.code,
          title: response?.name || selectedVoucher.title,
          name: response?.name || selectedVoucher.title,
          discountType: response?.discountType || selectedVoucher.discountType,
          discountValue: response?.discountValue || selectedVoucher.discountValue,
          discountTag:
            response?.discountType === "Percentage"
              ? `${response?.discountValue}%`
              : response?.discountValue >= 1000
                ? `${response?.discountValue / 1000}k`
                : `${response?.discountValue}đ`,
          status: (response?.status || "Unused").toLowerCase(),
          expiryDate: formatDateOnly(response?.expiresAt) || selectedVoucher.expiryDate,
          expiresAt: response?.expiresAt,
          badge: "Chưa dùng",
          description: selectedVoucher.description || selectedVoucher.conditions,
        }

        setNewlyRedeemedVoucher(newVoucher)
        setModalStep(MODAL_STEPS.SUCCESS)
        toast.success("Đổi voucher thành công!", { duration: 2000 })
        break
      } catch (err) {
        lastError = err
        const status = err?.status || err?.originalStatus
        const isBusinessError = typeof status === "number" && status >= 400 && status < 500

        // If it's a 4xx business error, don't retry
        if (isBusinessError) {
          break
        }

        // If network/5xx error and retries remain, wait 2s
        if (attempt < maxRetries) {
          console.warn(`[RedeemVoucher] Attempt ${attempt} failed, retrying in 2s...`, err)
          await sleep(2000)
        }
      }
    }

    setIsProcessingExchange(false)

    if (!isSuccessful) {
      const status = lastError?.status || lastError?.originalStatus
      const errorMessage =
        lastError?.data?.message || lastError?.data?.title || lastError?.message || ""

      // 1. Out of stock
      if (
        errorMessage.toLowerCase().includes("out of stock") ||
        errorMessage.toLowerCase().includes("hết lượt") ||
        errorMessage.toLowerCase().includes("hết hàng")
      ) {
        setModalStep(MODAL_STEPS.ERROR_OUT_OF_STOCK)
        return
      }

      // 2. Business error (4xx)
      if (typeof status === "number" && status >= 400 && status < 500) {
        setModalStep(MODAL_STEPS.NONE)
        setSelectedVoucher(null)
        toast.error(errorMessage || "Không thể đổi voucher vào lúc này.")
        return
      }

      // 3. Network or Server error after retries
      const userId = currentUser?.id || currentUser?.accountId || "GUEST"
      const timestamp = Math.floor(Date.now() / 1000)
      const errCode = `ERR-${timestamp}-${userId}`
      setTechnicalErrorCode(errCode)
      setModalStep(MODAL_STEPS.ERROR_NETWORK)
    }
  }, [selectedVoucher, isProcessingExchange, redeemVoucherMutation, currentUser])

  const handleCopyCode = useCallback((code) => {
    if (!code) return
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code)
      toast.success(`Đã sao chép mã ${code} vào bộ nhớ tạm!`, { duration: 2000 })
    } else {
      toast.success(`Đã sao chép mã ${code}!`, { duration: 2000 })
    }
  }, [])

  const handleGoToVault = useCallback(() => {
    handleCloseModal()
    setActiveTab(TAB_KEYS.VAULT)
    setVaultSubTab("unused")
  }, [handleCloseModal, setActiveTab])

  const handleUseVoucher = useCallback((voucher) => {
    toast.success(`Đã chọn mã ${voucher.code}. Bạn có thể áp dụng mã này khi thanh toán khóa học!`)
  }, [])

  return {
    // Navigation / Tabs
    activeTab,
    setActiveTab,
    TAB_KEYS,

    // Domain Data
    userPoints,
    earningMethods: EARNING_METHODS,
    recentActivities,
    vouchers: filteredExchangeVouchers,
    redeemablePreviewVouchers,
    vaultVouchers: filteredVaultVouchers,
    vaultCounts,
    pointHistory: filteredHistory,

    // Loading states (combines initial loading and active fetching)
    isLoadingOverview: isLoadingOverviewQuery,
    isFetchingOverview,
    isLoadingTemplates: isLoadingTemplatesQuery,
    isFetchingTemplates,
    isLoadingInventory: isLoadingInventoryQuery,
    isFetchingInventory,
    isLoadingHistory: isLoadingHistoryQuery,
    isFetchingHistory,

    // Refetch functions
    refetchOverview,
    refetchTemplates,
    refetchInventory,
    refetchHistory,

    // Modal state & actions
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

    // Filters & Pagination
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
  }
}
