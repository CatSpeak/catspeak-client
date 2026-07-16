import React from "react";
import { AfternoonIcon, EveningIcon, MorningIcon, NoonIcon } from "../../assets";

const TimeSectionIcon = ({ section }) => {
  let icon = MorningIcon;

  switch (section) {
    case "morning":
      icon = MorningIcon;
      break;
    case "noon":
      icon = NoonIcon;
      break;
    case "afternoon":
      icon = AfternoonIcon;
      break;
    case "evening":
      icon = EveningIcon;
      break;
    default:
      icon = MorningIcon;
  }

  return <img src={icon} alt={section} className="w-4 h-4 object-contain" />;
};

export default TimeSectionIcon;
