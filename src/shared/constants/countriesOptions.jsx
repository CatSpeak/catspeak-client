import React from "react"
import { countries } from "@/shared/constants/countriesData"

export const countryOptions = countries.map((c) => ({
  key: c.code,
  value: c.value,
  label: c.label,
  searchTerms: `${c.code} ${c.value} ${c.label}`,
  icon: (
    <img
      src={`https://flagcdn.com/w40/${c.value}.png`}
      className="w-[20px] h-[20px] rounded-full object-cover"
      alt={c.code}
    />
  ),
}))

export const phonePrefixes = countries
  .filter((c) => c.dialCode)
  .map((c) => ({
    key: c.code,
    value: c.dialCode,
    label: `${c.dialCode} (${c.label})`,
    subtitle: c.label,
    searchTerms: `${c.code} ${c.value} ${c.label} ${c.dialCode}`,
    icon: (
      <img
        src={`https://flagcdn.com/w40/${c.value}.png`}
        className="w-[20px] h-[20px] rounded-full object-cover"
        alt={c.code}
      />
    ),
  }))

export const parsePhoneData = (fullPhone) => {
  fullPhone = fullPhone || ""
  
  // Sort prefixes by length descending so that e.g. +844 is matched before +84 if it existed
  const sortedPrefixes = [...phonePrefixes].sort((a, b) => b.value.length - a.value.length)
  
  const match = sortedPrefixes.find((p) => fullPhone.startsWith(p.value))
  if (match) {
    return {
      phonePrefix: match.value,
      phoneNumber: fullPhone.slice(match.value.length)
    }
  }
  
  return { phonePrefix: "+84", phoneNumber: fullPhone }
}

export const getCountryOption = (valueOrCode) => {
  if (!valueOrCode) return null
  const normalized = String(valueOrCode).trim().toLowerCase()
  return (
    countryOptions.find(
      (c) =>
        c.value?.toLowerCase() === normalized ||
        c.key?.toLowerCase() === normalized ||
        c.label?.toLowerCase() === normalized,
    ) || null
  )
}

export const getCountryLabel = (valueOrCode, fallback = "") => {
  const opt = getCountryOption(valueOrCode)
  return opt ? opt.label : (valueOrCode || fallback)
}
