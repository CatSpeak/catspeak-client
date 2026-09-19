export const TARGET_BANDS = [
  {
    id: "hsk1_2",
    hskRange: [1, 2],
    tone: "emerald",
    difficulty: 1,
    recommended: false,
  },
  {
    id: "hsk3_4",
    hskRange: [3, 4],
    tone: "primary",
    difficulty: 2,
    recommended: true,
  },
  {
    id: "hsk5_6",
    hskRange: [5, 6],
    tone: "violet",
    difficulty: 3,
    recommended: false,
  },
]

export const DEFAULT_TARGET_BAND = "hsk3_4"

export const isTargetBand = (id) => TARGET_BANDS.some((band) => band.id === id)

export const getTargetBand = (id) =>
  TARGET_BANDS.find((band) => band.id === id) ||
  TARGET_BANDS.find((band) => band.id === DEFAULT_TARGET_BAND)
