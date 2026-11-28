import { describe, it, expect } from "vitest"
import {
  getGridClasses,
  isDefaultPlan,
  isUnlimitedLimit,
  isFeatureEnabled,
  isFeatureSuperiorToDefault,
} from "./planUtils"

describe("planUtils", () => {
  describe("getGridClasses", () => {
    it("stacks the 3-plan grid into one column until lg (ISS-38)", () => {
      const classes = getGridClasses(3)

      expect(classes).toContain("grid-cols-1")
      expect(classes).toContain("lg:grid-cols-3")
      expect(classes).not.toContain("md:grid-cols-3")
      expect(classes).toContain("max-w-xl")
      expect(classes).toContain("lg:max-w-7xl")
    })
  })

  describe("isDefaultPlan", () => {
    it("identifies plans with priceVnd = 0 or price = 0 as default", () => {
      expect(isDefaultPlan({ priceVnd: 0 })).toBe(true)
      expect(isDefaultPlan({ price: 0 })).toBe(true)
      expect(isDefaultPlan({ priceVnd: "0" })).toBe(true)
      expect(isDefaultPlan({ priceVnd: 199000 })).toBe(false)
    })

    it("falls back to planName containing 'free'", () => {
      expect(isDefaultPlan({ planName: "Free Plan" })).toBe(true)
      expect(isDefaultPlan({ name: "free membership" })).toBe(true)
      expect(isDefaultPlan({ planName: "Pro Plan", priceVnd: 199000 })).toBe(false)
    })

    it("returns false for null/undefined", () => {
      expect(isDefaultPlan(null)).toBe(false)
      expect(isDefaultPlan(undefined)).toBe(false)
    })
  })

  describe("isUnlimitedLimit", () => {
    it("detects -1 or 'unlimited' strings and numbers", () => {
      expect(isUnlimitedLimit(-1)).toBe(true)
      expect(isUnlimitedLimit("-1")).toBe(true)
      expect(isUnlimitedLimit("unlimited")).toBe(true)
      expect(isUnlimitedLimit("Unlimited")).toBe(true)
      expect(isUnlimitedLimit(10)).toBe(false)
      expect(isUnlimitedLimit(0)).toBe(false)
      expect(isUnlimitedLimit("")).toBe(false)
      expect(isUnlimitedLimit(null)).toBe(false)
    })

    it("detects isUnlimited boolean flag on feature objects", () => {
      expect(isUnlimitedLimit({ isUnlimited: true, limitValue: "10" })).toBe(true)
      expect(isUnlimitedLimit({ limitValue: "-1" })).toBe(true)
      expect(isUnlimitedLimit({ limitValue: "50" })).toBe(false)
    })
  })

  describe("isFeatureEnabled", () => {
    it("returns false for missing or deactivated features", () => {
      expect(isFeatureEnabled(null)).toBe(false)
      expect(isFeatureEnabled({ isMissing: true })).toBe(false)
      expect(isFeatureEnabled({ isActive: false })).toBe(false)
    })

    it("handles boolean valueType", () => {
      expect(isFeatureEnabled({ valueType: "boolean", limitValue: "false" })).toBe(false)
      expect(isFeatureEnabled({ valueType: "boolean", limitValue: "true" })).toBe(true)
      expect(isFeatureEnabled({ valueType: "boolean", limitValue: false })).toBe(false)
      expect(isFeatureEnabled({ valueType: "boolean", limitValue: true })).toBe(true)
    })

    it("handles numeric limits where 0 means disabled", () => {
      expect(isFeatureEnabled({ limitValue: "0" })).toBe(false)
      expect(isFeatureEnabled({ limitValue: 0 })).toBe(false)
      expect(isFeatureEnabled({ limitValue: "5" })).toBe(true)
      expect(isFeatureEnabled({ limitValue: "-1" })).toBe(true)
    })

    it("returns true for features without numeric limits", () => {
      expect(isFeatureEnabled({ featureName: "Community Access" })).toBe(true)
    })
  })

  describe("isFeatureSuperiorToDefault", () => {
    it("returns false if the paid feature itself is disabled or falsy", () => {
      const paid = { isActive: false, limitValue: "10" }
      const def = { isActive: true, limitValue: "5" }
      expect(isFeatureSuperiorToDefault(paid, def)).toBe(false)

      const paidMissing = { isMissing: true }
      expect(isFeatureSuperiorToDefault(paidMissing, def)).toBe(false)
    })

    it("returns true if default feature is missing or disabled, while paid is enabled", () => {
      const paid = { isActive: true, limitValue: "5" }
      expect(isFeatureSuperiorToDefault(paid, null)).toBe(true)
      expect(isFeatureSuperiorToDefault(paid, { isMissing: true })).toBe(true)
      expect(isFeatureSuperiorToDefault(paid, { isActive: false })).toBe(true)
      expect(isFeatureSuperiorToDefault(paid, { limitValue: "0" })).toBe(true)
      expect(isFeatureSuperiorToDefault(paid, { valueType: "boolean", limitValue: "false" })).toBe(true)
    })

    it("compares numeric limits", () => {
      const paidHigher = { isActive: true, limitValue: "50" }
      const defLower = { isActive: true, limitValue: "10" }
      expect(isFeatureSuperiorToDefault(paidHigher, defLower)).toBe(true)

      const paidEqual = { isActive: true, limitValue: "10" }
      expect(isFeatureSuperiorToDefault(paidEqual, defLower)).toBe(false)

      const paidLower = { isActive: true, limitValue: "5" }
      expect(isFeatureSuperiorToDefault(paidLower, defLower)).toBe(false)
    })

    it("handles unlimited limits vs finite limits", () => {
      const paidUnlimited = { isActive: true, limitValue: "-1" }
      const defFinite = { isActive: true, limitValue: "100" }
      expect(isFeatureSuperiorToDefault(paidUnlimited, defFinite)).toBe(true)

      const defUnlimited = { isActive: true, limitValue: "-1" }
      expect(isFeatureSuperiorToDefault(paidUnlimited, defUnlimited)).toBe(false)
    })

    it("returns false for boolean features that are already enabled in default", () => {
      const paidBool = { valueType: "boolean", limitValue: "true" }
      const defBool = { valueType: "boolean", limitValue: "true" }
      expect(isFeatureSuperiorToDefault(paidBool, defBool)).toBe(false)
    })
  })
})
