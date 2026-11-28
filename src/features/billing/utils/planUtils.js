export const getFeatureSuffix = (featureCode, t) => {
  return t?.billing?.planCard?.suffixes?.[featureCode] || ""
}

export const getGridClasses = (count) => {
  if (count === 1) return "max-w-lg mx-auto w-full flex justify-center"
  if (count === 2) return "grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto w-full items-stretch justify-center"
  if (count === 3) return "grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 max-w-xl lg:max-w-7xl mx-auto w-full items-stretch justify-center"
  return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto w-full items-stretch justify-center"
}

export const isUnlimitedLimit = (featureOrLimit) => {
  if (featureOrLimit && typeof featureOrLimit === "object") {
    if (featureOrLimit.isUnlimited === true) return true
    return isUnlimitedLimit(featureOrLimit.limitValue)
  }
  if (featureOrLimit === undefined || featureOrLimit === null || featureOrLimit === "") return false
  const normalized = String(featureOrLimit).trim().toLowerCase()
  return normalized === "-1" || normalized === "unlimited"
}

export const isDefaultPlan = (plan) => {
  if (!plan) return false
  const price = Number(plan.priceVnd ?? plan.price)
  if (!Number.isNaN(price) && price === 0) return true
  return (plan.planName ?? plan.name ?? "").toLowerCase().includes("free")
}

export const isFeatureEnabled = (feature) => {
  if (!feature || feature.isMissing || feature.isActive === false) return false
  const valueType = feature.valueType?.toLowerCase()
  if (valueType === "boolean") {
    return String(feature.limitValue).toLowerCase() !== "false"
  }
  const hasLimit =
    feature.limitValue !== undefined &&
    feature.limitValue !== null &&
    feature.limitValue !== ""
  if (hasLimit && !isUnlimitedLimit(feature)) {
    const numericLimit = Number(feature.limitValue)
    if (!Number.isNaN(numericLimit) && numericLimit === 0) return false
  }
  return true
}

export const isFeatureSuperiorToDefault = (feature, defaultFeature) => {
  if (!isFeatureEnabled(feature)) return false
  if (!defaultFeature || !isFeatureEnabled(defaultFeature)) return true

  const featureUnlimited = isUnlimitedLimit(feature)
  const defaultUnlimited = isUnlimitedLimit(defaultFeature)
  if (featureUnlimited && !defaultUnlimited) return true
  if (defaultUnlimited) return false

  const featureNum = Number(feature.limitValue)
  const defaultNum = Number(defaultFeature.limitValue)
  const hasNumericLimit =
    feature.limitValue !== undefined &&
    feature.limitValue !== null &&
    feature.limitValue !== "" &&
    defaultFeature.limitValue !== undefined &&
    defaultFeature.limitValue !== null &&
    defaultFeature.limitValue !== "" &&
    !Number.isNaN(featureNum) &&
    !Number.isNaN(defaultNum)

  if (hasNumericLimit) {
    return featureNum > defaultNum
  }

  if (
    feature.limitValue !== undefined &&
    feature.limitValue !== null &&
    defaultFeature.limitValue !== undefined &&
    defaultFeature.limitValue !== null
  ) {
    return String(feature.limitValue).trim() !== String(defaultFeature.limitValue).trim()
  }

  return false
}

