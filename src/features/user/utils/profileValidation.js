export const validatePhoneInput = (phoneNumber, prefix) => {
  if (!phoneNumber) return true
  const clean = phoneNumber.replace(/[\s\-\(\)]/g, "")
  if (!/^[0-9]+$/.test(clean)) return false

  if (prefix === "+84") {
    return /^(0?[35789]\d{8})$/.test(clean)
  }
  if (prefix === "+86") {
    return /^(1[3-9]\d{9})$/.test(clean)
  }
  if (prefix === "+1") {
    return /^([2-9]\d{9})$/.test(clean)
  }
  return clean.length >= 7 && clean.length <= 15
}

export const buildProfilePayload = (editingField, formData, overrides = {}) => {
  const payload = {
    nickname: null,
    country: null,
    address: null,
    phoneNumber: null,
    email: null,
  }

  if (editingField === "nickname") payload.nickname = formData.nickname
  if (editingField === "country") payload.country = formData.country
  if (editingField === "address") payload.address = formData.address
  if (editingField === "email") payload.email = formData.email

  return {
    ...payload,
    ...overrides,
  }
}
