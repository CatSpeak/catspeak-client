import React, { useState } from "react";
import VoucherSection from "./VoucherSection";
import { PillButton } from "@/shared/components/ui/buttons";
import {
  formatCurrency,
  calculateVoucherDiscount,
} from "../../utils/checkoutUtils";
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal";
import { AlertTriangle } from "lucide-react";

const OrderSummary = ({
  // className,
  unitPrice,
  learnersCount,
  vouchers,
  suggestedTags,
  selectedVouchers,
  onToggleVoucher,
  onRemoveVoucher,
  onOpenModal,
  onCheckout,
  isProcessing,
  isVoucherLoading,
  t,
}) => {
  const tc = t.billing.checkoutClass;
  const [voucherToRemove, setVoucherToRemove] = useState(null);
  const subtotal = unitPrice * learnersCount;

  const discountDetails = selectedVouchers.map((v) => ({
    ...v,
    discountAmount: calculateVoucherDiscount(v, subtotal),
  }));

  const totalDiscount = discountDetails.reduce(
    (sum, v) => sum + v.discountAmount,
    0,
  );
  const totalPayment = Math.max(0, subtotal - totalDiscount);

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl shadow-faq-card border border-border dark:border-[#3F3F3F] p-6 sticky top-24 space-y-4">
      <h2 className="text-xl font-bold text-[#111827] dark:text-white">{tc.orderSummary}</h2>

      <div className="space-y-1">
        {/* <h3 className="font-bold text-[#111827]">{className}</h3> */}
        {/* <p className="text-sm text-[#6B7280]">Lớp: {classCode}</p> */}
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between text-[#6B7280] dark:text-neutral-400">
          <span>{tc.unitPrice}</span>
          <span className="text-[#111827] dark:text-white">
            {unitPrice === 0
              ? tc.free
              : `${formatCurrency(unitPrice)} ${tc.perPerson}`}
          </span>
        </div>
        <div className="flex justify-between text-[#6B7280] dark:text-neutral-400">
          <span>{tc.learnerCount}</span>
          <span className="text-[#111827] dark:text-white">{learnersCount}</span>
        </div>
      </div>

      <div className="border-border dark:border-[#3F3F3F] border" />

      <div className="space-y-4">
        <div className="flex justify-between font-bold text-[#111827] dark:text-white">
          <span>{tc.subtotal}</span>
          <span>{subtotal === 0 ? tc.free : formatCurrency(subtotal)}</span>
        </div>

        {discountDetails.map((voucher) => (
          <div key={voucher.id} className="flex justify-between text-[#00A854] dark:text-emerald-400">
            <div className="flex flex-col">
              <span>
                {tc.discount} ({voucher.code})
              </span>
              {voucher.maxDiscountAmount &&
                voucher.discountType?.toLowerCase() === "percentage" && (
                  <span className="text-xs opacity-80">
                    {tc.maxDiscount} {formatCurrency(voucher.maxDiscountAmount)}
                  </span>
                )}
            </div>
            <span>-{formatCurrency(voucher.discountAmount)}</span>
          </div>
        ))}

        <div className="flex justify-between text-gray-600 dark:text-neutral-300">
          <span>{tc.tuition}</span>
          <span>
            {totalPayment === 0 ? tc.free : formatCurrency(totalPayment)}
          </span>
        </div>
      </div>

      {unitPrice !== 0 && (
        <>
          <div className="border-border dark:border-[#3F3F3F] border" />

          <VoucherSection
            vouchers={vouchers}
            suggestedTags={suggestedTags}
            selectedVouchers={selectedVouchers}
            onToggleVoucher={onToggleVoucher}
            onRemoveVoucher={setVoucherToRemove}
            onOpenModal={onOpenModal}
            isLoading={isVoucherLoading}
            t={t}
          />
        </>
      )}

      <div className="border-border dark:border-[#3F3F3F] border" />

      <div>
        <div className="flex justify-between items-end mb-1">
          <span className="font-bold text-[#111827] dark:text-white">{tc.totalPayment}</span>
          <span className="text-2xl font-bold text-[#B20000] dark:text-red-400">
            {totalPayment === 0 ? tc.free : formatCurrency(totalPayment)}
          </span>
        </div>
        {totalDiscount > 0 && (
          <p className="text-right text-sm text-[#00A854] dark:text-emerald-400">
            {tc.youSaved.replace("{{amount}}", formatCurrency(totalDiscount))}
          </p>
        )}
      </div>

      <PillButton
        fullWidth
        roundedClass="rounded-xl"
        className="flex-1 w-full"
        bgColor={"#B20000"}
        onClick={() => onCheckout(false)}
        disabled={isProcessing}
        loading={isProcessing}
        loadingText={tc.processing}
      >
        {tc.confirmPayment}
      </PillButton>

      <ConfirmationModal
        open={!!voucherToRemove}
        onClose={() => setVoucherToRemove(null)}
        onConfirm={() => {
          if (voucherToRemove) {
            onRemoveVoucher(voucherToRemove.id);
          }
          setVoucherToRemove(null);
        }}
        title={
          <div className="flex items-center gap-2.5">
            <div className="bg-red-50 dark:bg-rose-950/40 text-[#B20000] dark:text-red-400 rounded-full p-2 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <span className="text-lg font-black text-gray-950 dark:text-white">
              {tc.removeVoucherTitle}
            </span>
          </div>
        }
        cancelText={tc.cancel}
        confirmText={tc.removeVoucherConfirm}
        confirmVariant="destructive"
      >
        <div className="flex flex-col gap-4 mt-2 text-sm text-gray-600 dark:text-neutral-300 leading-relaxed">
          {voucherToRemove && (
            <p dangerouslySetInnerHTML={{
              __html: tc.removeVoucherDesc
                ?.replace("{{code}}", `<strong class="text-gray-900 dark:text-white font-bold">${voucherToRemove.code}</strong>`)
                ?.replace(
                  "{{totalAmount}}",
                  `<strong class="text-gray-900 dark:text-white font-bold">${formatCurrency(
                    totalPayment +
                      calculateVoucherDiscount(voucherToRemove, subtotal),
                  )}</strong>`
                )
                ?.replace(
                  "{{discountAmount}}",
                  `<strong class="text-gray-900 dark:text-white font-bold">${formatCurrency(
                    calculateVoucherDiscount(voucherToRemove, subtotal),
                  )}</strong>`
                )
            }} />
          )}
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default OrderSummary;
