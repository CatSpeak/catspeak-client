/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { ThumbsUp } from "lucide-react";

export const LikeBadge = ({ size = 24, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`shrink-0 block ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="12" fill="#1877F2" />
    <g transform="translate(12, 12) scale(0.55) translate(-12, -11)">
      <path
        d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"
        fill="white"
      />
    </g>
  </svg>
);

export const LoveBadge = ({ size = 24, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`shrink-0 block ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="12" fill="#FA383E" />
    <g transform="translate(12, 12) scale(0.55) translate(-12, -12.175)">
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="white"
      />
    </g>
  </svg>
);

export const HahaBadge = ({ size = 24, className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={`shrink-0 block ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="12" fill="#F7B125" />
    <g transform="translate(12, 12.5) scale(0.72) translate(-12, -14.5)">
      {/* Squinted eyes >< */}
      <path
        d="M5 9L8.5 11L5 13M19 9L15.5 11L19 13"
        stroke="#793B00"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Open laughing mouth */}
      <path
        d="M6 14C6.5 18 9 20 12 20C15 20 17.5 18 18 14H6Z"
        fill="#793B00"
      />
      {/* Tongue */}
      <path
        d="M8.5 14C8.8 16.5 10.2 18.2 12 18.2C13.8 18.2 15.2 16.5 15.5 14H8.5Z"
        fill="#EB4132"
      />
    </g>
  </svg>
);

export const ReactionBadge = ({ type, size = 20, className = "" }) => {
  const norm = String(type || "").toLowerCase();
  if (norm === "love" || norm === "2") {
    return <LoveBadge size={size} className={className} />;
  }
  if (norm === "haha" || norm === "3") {
    return <HahaBadge size={size} className={className} />;
  }
  if (norm === "like" || norm === "1") {
    return <LikeBadge size={size} className={className} />;
  }
  return (
    <ThumbsUp
      size={size}
      strokeWidth={1.8}
      className={`text-[#4b5563] ${className}`}
    />
  );
};

export const REACTION_CONFIG = {
  like: {
    key: "like",
    label: "Like",
    badge: LikeBadge,
    color: "#1877F2",
  },
  love: {
    key: "love",
    label: "Love",
    badge: LoveBadge,
    color: "#FA383E",
  },
  haha: {
    key: "haha",
    label: "Haha",
    badge: HahaBadge,
    color: "#F7B125",
  },
};

export const NEWS_REACTIONS = [
  {
    type: "Like",
    value: "Like",
    label: "Like",
    icon: ({ size = 24, className = "" }) => (
      <LikeBadge size={size} className={className} />
    ),
    hoverBgClass: "hover:scale-125 transition-transform duration-150",
  },
  {
    type: "Love",
    value: "Love",
    label: "Love",
    icon: ({ size = 24, className = "" }) => (
      <LoveBadge size={size} className={className} />
    ),
    hoverBgClass: "hover:scale-125 transition-transform duration-150",
  },
  {
    type: "Haha",
    value: "Haha",
    label: "Haha",
    icon: ({ size = 24, className = "" }) => (
      <HahaBadge size={size} className={className} />
    ),
    hoverBgClass: "hover:scale-125 transition-transform duration-150",
  },
];

export const COMMENT_FACEBOOK_REACTIONS = [
  {
    type: 1,
    value: 1,
    label: "Like",
    icon: ({ size = 20, className = "" }) => (
      <LikeBadge size={size} className={className} />
    ),
    hoverBgClass: "hover:scale-125 transition-transform duration-150",
  },
  {
    type: 2,
    value: 2,
    label: "Love",
    icon: ({ size = 20, className = "" }) => (
      <LoveBadge size={size} className={className} />
    ),
    hoverBgClass: "hover:scale-125 transition-transform duration-150",
  },
  {
    type: 3,
    value: 3,
    label: "Haha",
    icon: ({ size = 20, className = "" }) => (
      <HahaBadge size={size} className={className} />
    ),
    hoverBgClass: "hover:scale-125 transition-transform duration-150",
  },
];

export default ReactionBadge;

