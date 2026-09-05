import React, { useState } from 'react'
import { Search, Tag } from 'lucide-react'
import Modal from '@/shared/components/ui/Modal'
import TextInput from '@/shared/components/ui/inputs/TextInput'
import VoucherCategoryList from './VoucherCategoryList'

const VoucherModal = ({
  isOpen,
  onClose,
  voucherData,
  selectedVouchers,
  onToggleVoucher,
  orderAmount,
  t
}) => {
  const tc = t.billing.checkoutClass
  const [search, setSearch] = useState('')

  if (!isOpen) return null

  const filterBySearch = (list) => {
    if (!list) return []
    if (!search) return list
    return list.filter(v =>
      (v.code && v.code.toLowerCase().includes(search.toLowerCase())) ||
      (v.title && v.title.toLowerCase().includes(search.toLowerCase()))
    )
  }

  // Categorize vouchers based on API response structure
  const validVouchers = filterBySearch(voucherData?.availableVouchers)
  const invalidForClass = filterBySearch(voucherData?.notApplicableForClass)
  const ineligible = filterBySearch(voucherData?.notEligible)
  const expired = filterBySearch(voucherData?.expired)
  const outOfUses = filterBySearch(voucherData?.exhausted)

  const isAllEmpty = validVouchers.length === 0 && invalidForClass.length === 0 && ineligible.length === 0 && expired.length === 0 && outOfUses.length === 0

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      className="w-full max-w-2xl"
      title={tc.myOffers}
      headerClassName="p-4 border-b border-border flex justify-between items-center shrink-0"
      subHeader={
        <TextInput
          icon={Search}
          placeholder={tc.searchOffers}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          containerClassName="w-full"
        />
      }
      subHeaderClassName="p-4 border-b border-border shrink-0"
      bodyClassName="p-4 flex-1 overflow-y-auto !mb-0"
    >
      {isAllEmpty ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1864AB]">
            <Tag size={24} />
          </div>
          <h3 className="font-bold text-[#111827] mb-2">{tc.noOffersTitle}</h3>
          <p className="text-sm text-[#6B7280] max-w-xs mx-auto">
            {tc.noOffersDesc}
          </p>
        </div>
      ) : (
        <>
          <VoucherCategoryList title={tc.categoryValid} vouchers={validVouchers} category="valid" selectedVouchers={selectedVouchers} onToggleVoucher={onToggleVoucher} orderAmount={orderAmount} t={t} />
          <VoucherCategoryList title={tc.categoryInvalidClass} vouchers={invalidForClass} category="invalid_class" selectedVouchers={selectedVouchers} onToggleVoucher={onToggleVoucher} orderAmount={orderAmount} t={t} />
          <VoucherCategoryList title={tc.categoryIneligible} vouchers={ineligible} category="ineligible" selectedVouchers={selectedVouchers} onToggleVoucher={onToggleVoucher} orderAmount={orderAmount} t={t} />
          <VoucherCategoryList title={tc.categoryExpired} vouchers={expired} category="expired" selectedVouchers={selectedVouchers} onToggleVoucher={onToggleVoucher} orderAmount={orderAmount} t={t} />
          <VoucherCategoryList title={tc.categoryExhausted} vouchers={outOfUses} category="out_of_uses" selectedVouchers={selectedVouchers} onToggleVoucher={onToggleVoucher} orderAmount={orderAmount} t={t} />
        </>
      )}
    </Modal>
  )
}

export default VoucherModal
