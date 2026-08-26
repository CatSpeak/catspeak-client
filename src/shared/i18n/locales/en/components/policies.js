import intellectualPropertyPolicy from "./intellectualProperty"
import termsOfService from "./termsOfService"

export default {
  paymentPolicy: {
    intro:
      "Cat Speak - a global community platform connecting languages and cultures - This Payment Policy specifies the conditions applicable to payments when using paid services on the Cat Speak platform. Making a payment means the USER agrees to this Policy and Cat Speak's Terms of Service. Last updated: 02/23/2026",
    section1: {
      title: "1. Operating model",
      intro: "Cat Speak operates on a hybrid model:",
      items: [
        "Subscription service - provides access to premium features, AI, supporting tools.",
        "Intermediary platform (Marketplace) - connects users to communicate and perform paid transactions with each other according to CAT SPEAK's regulations.",
        "Enterprise solutions (B2B) - provides services, accounts or licenses to use under a separate contract.",
      ],
    },
    section2: {
      title: "2. Service package payment (Subscription - B2C)",
      items: [
        "Service packages are provided on a prepaid model.",
        "Access is only activated upon successful payment.",
        "Service packages may self-renew if the user does not cancel before the renewal date.",
        "Paid fees are non-refundable, except in cases considered under Section V.",
      ],
    },
    section3: {
      title: "3. Payment on marketplace (P2P)",
      items: [
        "Users can make payments to other users through Cat Speak's system.",
        "Cat Speak acts as an intermediary processing transactions and may deduct a platform fee before transferring the remainder to the service provider.",
        "Cat Speak is not a direct service provider between Users.",
      ],
      rightsTitle: "Cat Speak has the right to:",
      rights: [
        "Hold payments for verification;",
        "Freeze transactions when there is a dispute;",
        "Require provision of evidence;",
        "Notify and submit to competent State authorities if detecting any signs of violation of Vietnamese law.",
      ],
    },
    section4: {
      title: "4. Enterprise payment (B2B)",
      items: [
        "Payment terms, deadlines, and refunds for businesses are governed by separate contracts.",
        "In case of discrepancy between the B2B contract and this Policy, the B2B contract will prevail.",
      ],
    },
    section5: {
      title: "5. Refund policy - Subscription (B2C)",
      generalRuleBold: "General principle:",
      generalRuleText:
        "Paid fees are non-refundable, unless required by law or in special cases below.",
      subjectiveRuleBold: "No refund for subjective reasons:",
      subjectiveRuleText: "Cat Speak will not issue a refund if the User:",
      reasons: [
        "Does not like the experience;",
        "Does not meet personal expectations;",
        "Does not use the service;",
        "Changes personal needs.",
      ],
      windowTitle: "3. Refund window for new users",
      windowIntro:
        "New users may request a refund within 07 (seven) days from the first payment if the User requests and meets all of the following requirements:",
      windowItems: [
        "Has not used more than 30% of the benefits;",
        "Has not violated any Terms and/or regulations;",
        "Has evidence of a serious technical error.",
      ],
      windowNote:
        "CAT SPEAK has sole discretion in considering, and CAT SPEAK's decision in this case is final, and the User has no right to complain.",
    },
    section6: {
      title: "6. Refunds in marketplace",
      paragraph1: "Refunds for Users will only be considered when:",
      items1: [
        "The service was not performed by the User providing the service;",
        "There is a request sent to CAT SPEAK from the User;",
        "There is authentic evidence of payment and violation of CAT SPEAK's regulations and/or relevant legal regulations. All evidence must be sent to CAT SPEAK according to regulations before the User requests a refund.",
      ],
      paragraph2: "CAT SPEAK is not responsible for refunding if:",
      items2: [
        "The dispute is subjective in nature for the User;",
        "The transaction and/or service was completed between Users;",
        "There is no reasonable and authentic evidence of a violation.",
      ],
      note: "Cat Speak can support mediation but has no obligation to compensate on behalf of the parties.",
    },
    section7: {
      title: "7. Evidence requirements",
      intro: "Users may request to provide relevant information:",
      items: [
        "Transaction code;",
        "Invoice;",
        "Screenshots;",
        "Exchange history;",
        "Detailed description of the incident.",
      ],
      note: "CAT SPEAK has the sole right to review and refuse processing if there are insufficient grounds or signs of fraud or dishonesty.",
    },
    section8: {
      title: "8. Refunds and fraud",
      items: [
        "CAT SPEAK reserves the right to suspend an account if it detects any abuse of refunds or valid refund requests.",
        "CAT SPEAK will only refund the User to the correct account that transferred money to CAT SPEAK previously and has recorded a successful transaction on the database system.",
        "Users may have to bear costs incurred related to the resolution of payment disputes.",
      ],
    },
    section9: {
      title:
        "9. Limitation of liability regarding AI (Artificial Intelligence)",
      items: [
        "Content and responses from AI are for academic support and reference only;",
        "No absolute guarantee of accuracy in form or content;",
        "CAT SPEAK assumes no responsibility for any decisions made by the User based on content generated by or provided to the User by AI.",
      ],
    },
    section10: {
      title: "10. Contact",
      intro:
        "If you have any questions or requests related to the payment policy, please contact:",
      contact: {
        email: "Email:",
        website: "Website:",
        fanpage: "Fanpage:",
        hotline: "Hotline:",
      },
      copyright: "@Copyright 2026 | Cat Speak - I speak you speak we peak",
    },
  },
  privacyPolicy: {
    title: "Privacy Policy",
    intro:
      "Cat Speak - a community platform connecting language learners - is committed to protecting the privacy and personal data of users. This privacy policy explains how we collect, use, store and protect your information when using our services.",

    section1: {
      title: "1. Information We Collect",
      intro: "When you use Cat Speak, we may collect:",
      items: [
        {
          label: "Basic personal information:",
          text: "Full name, email, phone number.",
        },
        {
          label: "Account information:",
          text: "Username, password, profile picture.",
        },
        {
          label: "Learning information:",
          text: "Lesson content, chat history, learning progress.",
        },
        {
          label: "Device and usage information:",
          text: "Device type, browser, IP address, cookies, access logs.",
        },
        {
          label: "User-generated content:",
          text: "Messages, posts, audio files/voice recordings and video chats.",
        },
      ],
    },

    section2: {
      title: "2. Purpose of Information Use",
      intro: "Cat Speak uses your data to:",
      items: [
        "Provide and improve language learning services.",
        "Personalize learning experience (suggest suitable content, classes and courses).",
        "Ensure security and prevent fraudulent activities.",
        "Support customers and respond to requests.",
        "Research, develop products and analyze data.",
        "Send notifications, updates and promotions (if you agree).",
      ],
    },

    section3: {
      title: "3. Information Sharing and Disclosure",
      intro:
        "We do not sell your personal information to third parties. However, in some cases, Cat Speak may share information with:",
      items: [
        "Technology partners (AI, server infrastructure, payment).",
        "Law enforcement agencies when legally required.",
        "Data analytics services (such as Google Analytics) to improve experience.",
      ],
    },

    section4: {
      title: "4. Data Security",
      intro:
        "We apply technical and organizational measures to protect user data, including:",
      items: [
        "Encryption of passwords and sensitive data.",
        "Strict internal access control.",
        "Firewall systems and security monitoring.",
        "Regular data backup and recovery.",
      ],
    },

    section5: {
      title: "5. User Rights",
      intro: "You have the right to:",
      items: [
        "Access, edit or delete personal information.",
        "Request export of your learning data.",
        "Send requests about privacy and security via Cat Speak support email.",
      ],
    },

    section6: {
      title: "6. Data Retention Period",
      items: [
        "Personal information is stored until you request account deletion, unless law requires longer retention.",
        "Learning data may be anonymized for research and product development purposes.",
      ],
    },

    section7: {
      title: "7. Cookies and Similar Technologies",
      intro:
        "Cookies are text files placed on the user's hard drive by a website server. Cookies are not used to run programs or introduce viruses to the user's computer. Cat Speak uses cookies to:",
      items: [
        "Remember login sessions.",
        "Analyze usage behavior to improve experience.",
        "Personalize content and advertisements (if any).",
      ],
      note: "You can customize cookie settings in your browser. However, if users choose to reject cookies, this may hinder and negatively affect some services and features that depend on cookies at Cat Speak.",
    },

    section8: {
      title: "8. Privacy Policy Changes",
      paragraphs: [
        'Cat Speak may change the content of the "Privacy Policy" without prior notice, to suit the needs of Cat Speak as well as customer feedback. When updating this policy content, we will revise the "Last Updated" time below.',
        'This "Privacy Policy" content only applies to Cat Speak, does not include or relate to third parties that advertise or have links at Cat Speak. We encourage users to carefully read the "Safety and Privacy Policy" of third-party websites before providing personal information to those websites.',
      ],
    },

    section9: {
      title: "9. Contact",
      intro:
        "If you have any questions or requests related to privacy policy, please contact:",
      contact: {
        email: "Email:",
        website: "Website:",
        fanpage: "Fanpage:",
        hotline: "Hotline:",
      },
      copyright: "© 2026 | Cat Speak - I speak you speak we peak",
    },
  },
  intellectualPropertyPolicy,
  termsOfService,
}
