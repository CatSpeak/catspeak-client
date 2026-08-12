import { useLanguage } from "@/shared/context/LanguageContext"
import colors from "@/shared/utils/colors"

const IntellectualPropertyPolicy = () => {
  const { t } = useLanguage()
  const policy = t.policies.intellectualPropertyPolicy

  return (
    <div className="space-y-4 text-gray-700">
      <p className="text-base leading-relaxed italic">{policy.intro}</p>

      {/* Section 1 */}
      <div className="pt-6 border-t border-border">
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {policy.section1.title}
        </h3>
        <p className="text-base leading-relaxed mb-2">
          {policy.section1.intro}
        </p>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {policy.section1.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p className="text-base leading-relaxed mt-2">{policy.section1.note}</p>
        <ul className="list-disc list-inside text-base space-y-1 ml-2 mt-1">
          {policy.section1.prohibitedItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p className="text-base leading-relaxed mt-2">
          {policy.section1.condition}
        </p>
      </div>

      {/* Section 2 */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {policy.section2.title}
        </h3>
        <p className="text-base leading-relaxed mb-2">
          {policy.section2.intro}
        </p>
        <p className="text-base leading-relaxed mb-2">
          {policy.section2.licenseIntro}
        </p>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {policy.section2.licenseItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p className="text-base leading-relaxed mt-2 mb-2">
          {policy.section2.commitIntro}
        </p>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {policy.section2.commitItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Section 3 */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {policy.section3.title}
        </h3>
        <p className="text-base leading-relaxed mb-2">
          {policy.section3.intro}
        </p>
        <p className="text-base leading-relaxed mb-2">
          {policy.section3.noticeIntro}
        </p>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {policy.section3.noticeItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p className="text-base leading-relaxed mt-2 mb-2">
          {policy.section3.rightsIntro}
        </p>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {policy.section3.rightsItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Section 4 */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {policy.section4.title}
        </h3>
        <p className="text-base leading-relaxed">{policy.section4.text}</p>
      </div>

      {/* Section 5 */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {policy.section5.title}
        </h3>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {policy.section5.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Section 6 */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {policy.section6.title}
        </h3>
        <p className="text-base leading-relaxed mb-2">
          {policy.section6.intro}
        </p>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {policy.section6.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <p className="text-base leading-relaxed mt-2 mb-2">
          {policy.section6.rightsIntro}
        </p>
        <ul className="list-disc list-inside text-base space-y-1 ml-2">
          {policy.section6.rightsItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Section 7 */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {policy.section7.title}
        </h3>
        {policy.section7.paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className={`text-base leading-relaxed${index > 0 ? " mt-2" : ""}`}
          >
            {paragraph}
          </p>
        ))}
      </div>

      {/* Section 8 - Contact */}
      <div>
        <h3 className="font-bold text-[#8f0d15] mb-2 text-lg">
          {policy.section8.title}
        </h3>
        <p className="text-base leading-relaxed mb-2">
          {policy.section8.intro}
        </p>
        <ul className="list-none text-base space-y-1 ml-2">
          <li>
            <strong>{policy.section8.contact.email}</strong>{" "}
            catspeak.vn@gmail.com
          </li>
          <li>
            <strong>{policy.section8.contact.website}</strong>{" "}
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
            <strong>{policy.section8.contact.fanpage}</strong>{" "}
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
            <strong>{policy.section8.contact.hotline}</strong> 0868192604
          </li>
        </ul>

        <p className="text-small mt-8 text-center uppercase text-[#7A7574]">
          {policy.section8.copyright}
        </p>
      </div>
    </div>
  )
}

export default IntellectualPropertyPolicy
