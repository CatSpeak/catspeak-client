import workshop1 from "@/shared/assets/images/workshops/zh/workshop1.jpg"
import workshop2 from "@/shared/assets/images/workshops/zh/workshop2.jpg"
import workshop3 from "@/shared/assets/images/workshops/zh/workshop3.png"
import workshopen1 from "@/shared/assets/images/workshops/en/workshop1.png"

/**
 * Utility to get the workshop slides data.
 * @param {Object} t - Translation object from i18n context
 * @param {string} lang - Selected community language
 * @param {Array} propSlides - Additional slides passed as props
 * @returns {Array} Combined slides array
 */
export const getWorkshopSlides = (t, lang, propSlides = []) => {
  return [
    {
      title: t.workshops?.englishWorkshop?.title || "English Workshop",
      subtext: t.workshops?.englishWorkshop?.introText1 || "",
      cta: t.workshops?.englishWorkshop?.cta || "View details",
      image: workshopen1,
      modal: "english",
    },
    {
      title: t.workshops?.hskWorkshop?.title || "HSK Workshop",
      subtext: t.workshops?.hskWorkshop ? `${t.workshops.hskWorkshop.introText1} ${t.workshops.hskWorkshop.introText2}` : "",
      cta: t.workshops?.hskWorkshop?.cta || "View details",
      image: workshop2,
      modal: "hsk",
    },
    {
      title: t.workshops?.chinaWorkshop?.title || "China Workshop",
      subtext: t.workshops?.chinaWorkshop ? `${t.workshops.chinaWorkshop.introText} ${t.workshops.chinaWorkshop.introHighlight} ${t.workshops.chinaWorkshop.introClosing}` : "",
      cta: t.workshops?.chinaWorkshop?.cta || "View details",
      image: workshop1,
      modal: "china",
    },
    {
      title: t.workshops?.scholarshipWorkshop?.title || "Scholarship Workshop",
      subtext: t.workshops?.scholarshipWorkshop ? t.workshops.scholarshipWorkshop.introText : "",
      cta: t.workshops?.scholarshipWorkshop?.cta || "View details",
      image: workshop3,
      modal: "scholarship",
    },
    ...propSlides,
  ]
}
