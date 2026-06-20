import workshop1 from "@/shared/assets/images/workshops/zh/workshop1.jpg"
import workshop2 from "@/shared/assets/images/workshops/zh/workshop2.jpg"
import workshop3 from "@/shared/assets/images/workshops/zh/workshop3.png"
import workshopen1 from "@/shared/assets/images/workshops/en/workshop1.png"
import logoDefault from "@/shared/assets/images/LogoDefault.png"

/**
 * Utility to get the workshop slides data.
 * @param {Object} t - Translation object from i18n context
 * @param {string} lang - Selected community language
 * @param {Array} propSlides - Additional slides passed as props
 * @returns {Array} Combined slides array
 */
export const getWorkshopSlides = (t, lang, propSlides = []) => {
  if (lang === "en") {
    return [
      {
        title: t.workshops.englishWorkshop?.title,
        subtext: t.workshops.englishWorkshop?.introText1,
        cta: t.workshops.englishWorkshop?.cta,
        image: workshopen1,
        modal: "english",
      },
      ...propSlides,
    ]
  }

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
    {
      title: t.workshops.scholarshipWorkshop?.title,
      subtext: t.workshops.scholarshipWorkshop ? t.workshops.scholarshipWorkshop.introText : "",
      cta: t.workshops.scholarshipWorkshop?.cta,
      image: workshop3,
      modal: "scholarship",
    },
    ...propSlides,
  ]
}
