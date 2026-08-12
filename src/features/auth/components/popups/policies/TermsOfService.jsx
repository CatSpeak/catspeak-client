import { useLanguage } from "@/shared/context/LanguageContext"
import colors from "@/shared/utils/colors"

const TermsOfService = () => {
  const { t } = useLanguage()
  const terms = t.termsOfService

  return (
    <div className="space-y-4 text-gray-700">
      {/* Intro */}
      <p className="leading-relaxed italic">{terms.intro}</p>

      {/* Section 1: Information Security */}
      <div className="pt-6 border-t border-border">
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {terms.section1.title}
        </h3>
        {terms.section1.paragraphs.map((para, i) => (
          <p key={i} className="text-base leading-relaxed mb-2">
            {para}
          </p>
        ))}
      </div>

      {/* Section 2: Scope of Services */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {terms.section2.title}
        </h3>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {terms.section2.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Section 3: Service Availability */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {terms.section3.title}
        </h3>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {terms.section3.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Section 4: Service Fees */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {terms.section4.title}
        </h3>
        <p className="text-base leading-relaxed mb-2">{terms.section4.intro}</p>
        <ul className="list-disc list-inside text-base space-y-1 ml-2 mb-2">
          {terms.section4.feeItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p className="text-base leading-relaxed mb-2">
          {terms.section4.moreIntro1}
        </p>
        <p className="text-base leading-relaxed mb-2">
          {terms.section4.moreIntro2}
        </p>
        <ul className="list-disc list-inside text-base space-y-1 ml-2 mb-2">
          {terms.section4.ageItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p className="text-base leading-relaxed mb-2">
          {terms.section4.moreIntro3}
        </p>
        <p className="text-base leading-relaxed mb-2">
          {terms.section4.moreIntro4}
        </p>
        <p className="text-base leading-relaxed">{terms.section4.moreIntro5}</p>
      </div>

      {/* Section 5: Information Provision */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {terms.section5.title}
        </h3>
        <p className="text-base leading-relaxed mb-2">{terms.section5.intro}</p>
        <ul className="list-disc list-inside text-base space-y-1 ml-2 mb-2">
          {terms.section5.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p className="text-base leading-relaxed">{terms.section5.outro}</p>
      </div>

      {/* Section 6: User Rights */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {terms.section6.title}
        </h3>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {terms.section6.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Section 7: User Obligations */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {terms.section7.title}
        </h3>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {terms.section7.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p className="text-base leading-relaxed mt-2">{terms.section7.note}</p>
      </div>

      {/* Section 8: CAT SPEAK's Rights */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {terms.section8.title}
        </h3>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {terms.section8.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Section 9: CAT SPEAK's Rights and Obligations */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {terms.section9.title}
        </h3>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {terms.section9.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Section 10: Limitation of Liability */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {terms.section10.title}
        </h3>
        <p className="text-base leading-relaxed mb-2">
          {terms.section10.intro}
        </p>
        <ul className="list-disc list-inside text-base space-y-1 ml-2 mb-2">
          {terms.section10.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p className="text-base leading-relaxed">{terms.section10.outro}</p>
      </div>

      {/* Section 11: Governing Law and Dispute Resolution */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {terms.section11.title}
        </h3>
        {terms.section11.paragraphs.map((para, i) => (
          <p key={i} className="text-base leading-relaxed mb-2">
            {para}
          </p>
        ))}
      </div>

      {/* Section 12: General Provisions */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {terms.section12.title}
        </h3>
        {terms.section12.paragraphs.map((para, i) => (
          <p key={i} className="text-base leading-relaxed mb-2">
            {para}
          </p>
        ))}
      </div>

      {/* Contact */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {terms.contact.title}
        </h3>
        <p className="text-base leading-relaxed mb-2">{terms.contact.intro}</p>
        <ul className="list-none text-base space-y-1 ml-2">
          <li>
            <strong>{terms.contact.labels.email}</strong> catspeak.vn@gmail.com
          </li>
          <li>
            <strong>{terms.contact.labels.website}</strong>{" "}
            <a
              href="https://catspeak.com.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
              style={{ color: colors.red[700] }}
            >
              https://catspeak.com.vn
            </a>
          </li>
          <li>
            <strong>{terms.contact.labels.fanpage}</strong>{" "}
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
            <strong>{terms.contact.labels.hotline}</strong> 0868192604
          </li>
        </ul>

        <p className="text-sm mt-8 text-center uppercase text-[#7A7574]">
          {terms.contact.copyright}
        </p>
      </div>
    </div>
  )
}

export default TermsOfService
