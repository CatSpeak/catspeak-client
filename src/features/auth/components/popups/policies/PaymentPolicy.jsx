import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import colors from "@/shared/utils/colors"

const PaymentPolicy = () => {
  const { t } = useLanguage()
  const policy = t.policies.paymentPolicy

  return (
    <div className="space-y-4 text-gray-700">
      <p className="leading-relaxed italic">{policy.intro}</p>

      {/* Section 1 */}
      <div className="pt-6 border-t border-border">
        <h3 className="font-bold text-[#8f0d15] mb-2">
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
        <h3 className="font-bold text-[#8f0d15] mb-2">
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
        <h3 className="font-bold text-[#8f0d15] mb-2">
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
        <h3 className="font-bold text-[#8f0d15] mb-2">
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
        <h3 className="font-bold text-[#8f0d15] mb-2">
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
        <h3 className="font-bold text-[#8f0d15] mb-2">
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
        <h3 className="font-bold text-[#8f0d15] mb-2">
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
        <h3 className="font-bold text-[#8f0d15] mb-2">
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
        <h3 className="font-bold text-[#8f0d15] mb-2">
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
        <h3 className="font-bold text-[#8f0d15] mb-2">
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
              className="underline hover:opacity-80"
              style={{ color: colors.red[700] }}
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
              className="underline hover:opacity-80"
              style={{ color: colors.red[700] }}
            >
              https://www.facebook.com/CatSpeak
            </a>
          </li>
          <li>
            <strong>{policy.section10.contact.hotline}</strong> 0868192604
          </li>
        </ul>

        <p className="text-sm mt-8 text-center uppercase text-[#7A7574]">
          {policy.section10.copyright}
        </p>
      </div>
    </div>
  )
}

export default PaymentPolicy
