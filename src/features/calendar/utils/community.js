import { getCommunityLang } from "@/shared/utils/navigation";

/** Community codes used in routes and the event form select. */
export const COMMUNITY_CODES = ["zh", "en", "ja"];

/** Canonical values the backend stores, keyed by community code. */
export const COMMUNITY_CODE_TO_VALUE = {
  zh: "Chinese",
  en: "English",
  ja: "Japanese",
};

/**
 * Maps a stored community ("Chinese"/"English"/"Japanese"), a code ("zh"/"en"/"ja")
 * or null/empty to the canonical code used by the form select. Returns "" when
 * the value is unknown or unassigned.
 */
export const communityCodeFromValue = (value) => {
  if (!value) return "";
  const normalized = String(value).trim().toLowerCase();
  if (["zh", "cn", "china", "chinese"].includes(normalized)) return "zh";
  if (["en", "eng", "english"].includes(normalized)) return "en";
  if (["ja", "jpn", "japanese"].includes(normalized)) return "ja";
  return "";
};

/**
 * Default community for a new event: the community being viewed on `/{lang}/cat-speak/*`,
 * or the saved community outside it (getCommunityLang handles the fallback).
 */
export const getDefaultCommunityCode = (pathname) => {
  const match = /^\/([a-z]{2})\/cat-speak(\/|$)/.exec(pathname || "");
  if (match && COMMUNITY_CODES.includes(match[1])) return match[1];
  return getCommunityLang();
};
