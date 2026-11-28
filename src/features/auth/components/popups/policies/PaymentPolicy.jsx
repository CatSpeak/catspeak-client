import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"

const PaymentPolicy = () => {
  const { t } = useLanguage()
  const policy = t.policies.paymentPolicy

  return (
    <div className="space-y-4 text-gray-700 dark:text-neutral-300">
      <p className="leading-relaxed italic">{policy.intro}</p>

      {/* Section 1 */}
      <div className="pt-6 border-t border-border dark:border-[#3F3F3F]">
        <h3 className="font-bold text-[#8f0d15] dark:text-red-400 mb-2">
          {policy.section1.title}
        </h3>
        {policy.section1.intro && (
          <p className="text-base leading-relaxed mb-2">
            {policy.section1.intro}
          </p>
        )}
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {policy.section1.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Section 2 */}
      <div>
        <h3 className="font-bold text-[#8f0d15] dark:text-red-400 mb-2">
          {policy.section2.title}
        </h3>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {policy.section2.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Section 3 */}
      <div>
        <h3 className="font-bold text-[#8f0d15] dark:text-red-400 mb-2">
          {policy.section3.title}
        </h3>
        <ul className="list-disc list-inside text-base space-y-1 ml-2 mb-2">
          {policy.section3.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        {policy.section3.rightsTitle && (
          <>
            <p className="text-base leading-relaxed font-semibold mt-2">
              {policy.section3.rightsTitle}
            </p>
            <ul className="list-disc list-inside text-base space-y-1 ml-2">
              {policy.section3.rights.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Section 4 */}
      <div>
        <h3 className="font-bold text-[#8f0d15] dark:text-red-400 mb-2">
          {policy.section4.title}
        </h3>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {policy.section4.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Section 5 */}
      <div>
        <h3 className="font-bold text-[#8f0d15] dark:text-red-400 mb-2">
          {policy.section5.title}
        </h3>
        <p className="text-base leading-relaxed mb-2">
          <strong>{policy.section5.generalRuleBold}</strong>{" "}
          {policy.section5.generalRuleText}
        </p>

        <p className="text-base leading-relaxed mb-2">
          <strong>{policy.section5.subjectiveRuleBold}</strong>{" "}
          {policy.section5.subjectiveRuleText}
        </p>
        <ul className="list-disc list-inside text-base space-y-1 ml-2 mb-2">
          {policy.section5.reasons.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <p className="text-base leading-relaxed mt-4 mb-2">
          <strong>{policy.section5.windowTitle}</strong>
        </p>
        <p className="text-base leading-relaxed mb-2">
          {policy.section5.windowIntro}
        </p>
        <ul className="list-disc list-inside text-base space-y-1 ml-2 mb-2">
          {policy.section5.windowItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p className="text-base leading-relaxed mt-2 italic">
          {policy.section5.windowNote}
        </p>
      </div>

      {/* Section 6 */}
      <div>
        <h3 className="font-bold text-[#8f0d15] dark:text-red-400 mb-2">
          {policy.section6.title}
        </h3>
        <p className="text-base leading-relaxed mb-2">
          <strong>{policy.section6.paragraph1}</strong>
        </p>
        <ul className="list-disc list-inside text-base space-y-1 ml-2 mb-2">
          {policy.section6.items1.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <p className="text-base leading-relaxed mt-4 mb-2">
          <strong>{policy.section6.paragraph2}</strong>
        </p>
        <ul className="list-disc list-inside text-base space-y-1 ml-2 mb-2">
          {policy.section6.items2.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p className="text-base leading-relaxed mt-2 italic">
          {policy.section6.note}
        </p>
      </div>

      {/* Section 7 */}
      <div>
        <h3 className="font-bold text-[#8f0d15] dark:text-red-400 mb-2">
          {policy.section7.title}
        </h3>
        {policy.section7.intro && (
          <p className="text-base leading-relaxed mb-2">
            {policy.section7.intro}
          </p>
        )}
        <ul className="list-disc list-inside text-base space-y-1 ml-2 mb-2">
          {policy.section7.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p className="text-base leading-relaxed mt-2 italic">
          {policy.section7.note}
        </p>
      </div>

      {/* Section 8 */}
      <div>
        <h3 className="font-bold text-[#8f0d15] dark:text-red-400 mb-2">
          {policy.section8.title}
        </h3>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {policy.section8.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Section 9 */}
      <div>
        <h3 className="font-bold text-[#8f0d15] dark:text-red-400 mb-2">
          {policy.section9.title}
        </h3>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {policy.section9.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Contact Section 10 */}
      <div>
        <h3 className="font-bold text-[#8f0d15] dark:text-red-400 mb-2">
          {policy.section10.title}
        </h3>
        <p className="text-base leading-relaxed mb-2">
          {policy.section10.intro}
        </p>
        <ul className="list-none text-base space-y-1 ml-2">
          <li>
            <strong>{policy.section10.contact.email}</strong>{" "}
            catspeak.vn@gmail.com
          </li>
          <li>
            <strong>{policy.section10.contact.website}</strong>{" "}
            <a
              href="https://catspeak.com.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="underline break-all text-[#990011] dark:text-[#FF8599] hover:opacity-80"
            >
              catspeak.com.vn
            </a>
          </li>
          <li>
            <strong>{policy.section10.contact.fanpage}</strong>{" "}
            <a
              href="https://www.facebook.com/CatSpeak"
              target="_blank"
              rel="noopener noreferrer"
              className="underline break-all text-[#990011] dark:text-[#FF8599] hover:opacity-80"
            >
              https://www.facebook.com/CatSpeak
            </a>
          </li>
          <li>
            <strong>{policy.section10.contact.hotline}</strong> 0868192604
          </li>
        </ul>
      </div>

      {/* Section 11: Teacher voucher deposit & refund terms (ISS-76) */}
      <div>
        <h3 className="font-bold text-[#8f0d15] dark:text-red-400 mb-2">
          {policy.depositTerms?.title ||
            "11. Điều khoản cọc và hoàn tiền voucher Giảng viên"}
        </h3>
        {policy.depositTerms?.intro && (
          <p className="text-base leading-relaxed mb-2">
            {policy.depositTerms.intro}
          </p>
        )}
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {(
            policy.depositTerms?.items || [
              "Khoản cọc được tính theo giá trị giảm tối đa trên mỗi lượt sử dụng nhân với tổng số lượt sử dụng (hoặc theo giới hạn ngân sách của voucher).",
              "Voucher chỉ được kích hoạt và hiển thị cho Học viên sau khi Admin xác nhận đã nhận đủ khoản cọc trong vòng 24 giờ làm việc.",
              "Nếu voucher hết hạn mà chưa sử dụng hết, phần cọc tương ứng với số lượt chưa dùng sẽ được hoàn lại theo quy trình hoàn tiền của Cat Speak.",
              "Khoản cọc không được hoàn lại nếu voucher bị hủy do Giảng viên vi phạm quy định nền tảng hoặc do thông tin voucher không chính xác.",
            ]
          ).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* R1-4: copyright always closes the modal, after every policy section. */}
      <p className="text-sm mt-8 text-center uppercase text-[#7A7574] dark:text-neutral-400">
        {policy.section10.copyright}
      </p>
    </div>
  )
}

export default PaymentPolicy
