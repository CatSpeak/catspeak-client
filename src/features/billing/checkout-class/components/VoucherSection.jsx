import React, { useState } from 'react'
import { Tag, ChevronDown, Check, Search, Loader2 } from 'lucide-react'
import TextInput from '@/shared/components/ui/inputs/TextInput'
import Checkbox from '@/shared/components/ui/inputs/Checkbox'
import Popover from '@/shared/components/ui/Popover'
import { useTimezone } from '@/shared/hooks/useTimezone'
import { formatCurrency } from '../../utils/checkoutUtils'
import { LoadingSpinner } from '@/shared/components/ui/indicators'

const VoucherSection = ({
  vouchers, // from availableVouchers
  suggestedTags, // array of strings (codes)
  selectedVouchers,
  onToggleVoucher,
  onOpenModal,
  isLoading,
  t
}) => {
  const tc = t.billing.checkoutClass
  const [search, setSearch] = useState('')
  const { formatDate } = useTimezone()

  // The dropdown shows all available vouchers
  const validVouchers = vouchers || []
  const suggestedVouchers = validVouchers.filter(v => (suggestedTags || []).includes(v.code))

  const filteredVouchers = validVouchers.filter(v =>
    v.code.toLowerCase().includes(search.toLowerCase()) ||
    v.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggle = (voucher) => {
    // If already selected, we can unselect
    // If not selected, only select if we have less than 2
    const isSelected = selectedVouchers.some(v => v.id === voucher.id)
    if (!isSelected && selectedVouchers.length >= 2) {
      return
    }
    onToggleVoucher(voucher)
  }

  const renderDropdownContent = (close) => (
    <div className="w-[340px] bg-white border border-border rounded-xl shadow-lg flex flex-col max-h-[400px]">
      <div className="p-3 border-b border-border">
        <TextInput
          icon={Search}
          placeholder={tc.searchVoucher}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-y-auto flex-1">
        {filteredVouchers.map(voucher => {
          const isSelected = selectedVouchers.some(v => v.id === voucher.id)
          const isDisabled = !isSelected && selectedVouchers.length >= 2

          return (
            <div
              key={voucher.id}
              className={`p-3 border-b border-border flex items-start gap-3 cursor-pointer last:border-0 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              onClick={() => !isDisabled && handleToggle(voucher)}
            >
              <div className="mt-0.5">
                <Checkbox
                  checked={isSelected}
                  onChange={() => { }}
                  disabled={isDisabled}
                />
              </div>
              <div>
                <p className="font-bold text-sm text-[#111827]">{voucher.code}</p>
                <p className="text-xs text-[#6B7280] mt-1">{voucher.title}</p>
                {voucher.maxDiscountAmount && voucher.discountType?.toLowerCase() === 'percentage' && (
                  <p className="text-xs text-[#6B7280] mt-1">{tc.maxDiscount} {formatCurrency(voucher.maxDiscountAmount)}</p>
                )}
                <p className="text-xs text-[#6B7280] mt-1">{tc.expiry} {voucher.isNeverExpired ? tc.neverExpires : formatDate(voucher.validTo)}</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="p-3 border-t border-border text-center shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            close();
            onOpenModal();
          }}
          className="text-[#B20000] text-sm font-semibold hover:underline"
        >
          {tc.viewAllOffers}
        </button>
      </div>
    </div>
  )

  // If there are selected vouchers, show the "Applied" state
  if (selectedVouchers.length > 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-[#111827]">{tc.voucherCode}</h3>
          {isLoading && <Loader2 size={16} className="animate-spin text-[#B20000]" />}
        </div>
        <div className="bg-[#E8F8F0] border border-[#A7E3C3] rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-[#00A854] font-bold">
              <Check size={18} />
              <span>{tc.appliedCount.replace('{{count}}', selectedVouchers.length)}</span>
            </div>
            <Popover
              placement="top-right"
              trigger={
                <span className="text-[#B20000] text-sm font-semibold hover:underline">
                  {tc.change}
                </span>
              }
              content={renderDropdownContent}
            />
          </div>

          <div className="space-y-3">
            {selectedVouchers.map(voucher => (
              <div key={voucher.id} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold text-[#111827] mr-2">{voucher.code}</span>
                  <span className="text-[#6B7280]">({voucher.sponsorType === 'CatSpeak' ? 'CatSpeak' : tc.sponsorInstructor})</span>
                </div>
                <span className="text-[#111827]">
                  - {voucher.discountType?.toLowerCase() === 'percentage' ? `${voucher.discountValue}%` : `${voucher.discountValue / 1000}k`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Default state: no vouchers selected
  return (
    <div>
      <h3 className="font-bold text-[#111827] mb-3">{tc.voucherCode}</h3>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div>
          {/* Suggested Tags */}
          {suggestedVouchers.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedVouchers.map(voucher => (
                <button
                  key={voucher.id}
                  onClick={() => handleToggle(voucher)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-[#A7E3C3] text-[#00A854] bg-[#E8F8F0] rounded-full text-xs font-semibold hover:bg-[#d1f0df] transition-colors"
                >
                  <Tag size={12} />
                  {voucher.code}
                </button>
              ))}
            </div>
          )}

          {validVouchers.length > 0 ? (
            <Popover
              placement="top-right"
              triggerClassName="w-full flex-1"
              trigger={
                <div className="w-full flex items-center justify-between p-3 border border-border rounded-xl text-sm bg-[#f3f3f3] hover:bg-[#e5e5e5] transition-colors">
                  <span className="flex items-center gap-2 text-[#B20000] font-semibold">
                    <Tag size={16} /> {tc.selectFromMyVouchers}
                  </span>
                  <ChevronDown size={16} />
                </div>
              }
              content={renderDropdownContent}
            />
          ) : (
            <div className="p-4 border border-border rounded-xl text-center bg-[#f3f3f3]">
              <p className="text-sm text-[#6B7280] mb-2">{tc.noVouchersForClass}</p>
              <button
                onClick={onOpenModal}
                className="text-[#B20000] text-sm font-semibold hover:underline"
              >
                {tc.viewAllOffers}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VoucherSection