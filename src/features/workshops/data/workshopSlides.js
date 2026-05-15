import workshop1 from "@/shared/assets/images/workshops/workshop1.jpg"
import workshop2 from "@/shared/assets/images/workshops/workshop2.jpg"
import logoDefault from "@/shared/assets/images/LogoDefault.png"

/**
 * Utility to get the workshop slides data.
 * @param {Object} t - Translation object from i18n context
 * @param {string} lang - Selected community language
 * @param {Array} propSlides - Additional slides passed as props
 * @returns {Array} Combined slides array
 */
export const getWorkshopSlides = (t, lang, propSlides = []) => {
  if (lang !== "zh") {
    return [
      {
        title: t.workshops.heroCarousel.comingSoonTitle,
        subtext: "",
        cta: t.workshops.heroCarousel.comingSoonTitle,
        image: logoDefault,
        modal: "development",
      },
      ...propSlides,
    ]
  }

  return [
    {
      title: t.workshops.hskWorkshop?.title,
      subtext: t.workshops.hskWorkshop ? `${t.workshops.hskWorkshop.introText1} ${t.workshops.hskWorkshop.introText2}` : "",
      cta: t.workshops.hskWorkshop?.cta,
      image: workshop2,
      modal: "hsk",
    },
    {
      title: t.workshops.chinaWorkshop?.title,
      subtext: t.workshops.chinaWorkshop ? `${t.workshops.chinaWorkshop.introText} ${t.workshops.chinaWorkshop.introHighlight} ${t.workshops.chinaWorkshop.introClosing}` : "",
      cta: t.workshops.chinaWorkshop?.cta,
      image: workshop1,
      modal: "china",
    },
    ...propSlides,
  ]
}
