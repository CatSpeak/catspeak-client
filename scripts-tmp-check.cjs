const fs = require("fs")
const files = [
  "src/features/ai-tutor/components/galaxy/GalaxyView.jsx",
  "src/features/ai-tutor/components/galaxy/core/GalaxyRenderer.js",
  "src/features/ai-tutor/components/galaxy/core/layoutGenerator.js",
  "src/features/ai-tutor/components/galaxy/core/shaders.js",
  "src/features/ai-tutor/components/galaxy/core/galaxyState.js",
  "src/features/ai-tutor/components/galaxy/hooks/useGalaxyEngine.js",
  "src/features/ai-tutor/components/galaxy/hooks/useGalaxyWordsMock.js",
  "src/features/ai-tutor/components/galaxy/hooks/useGalaxyWords.js",
  "src/features/ai-tutor/components/galaxy/mocks/mockGalaxyData.js",
  "src/features/ai-tutor/pages/VocabularyGalaxyPage.jsx",
  "src/features/ai-tutor/i18n/vi.js",
  "src/features/ai-tutor/i18n/zh.js",
  "src/features/ai-tutor/i18n/ja.js",
  "src/features/ai-tutor/i18n/en.js",
]
for (const f of files) {
  const lines = fs.readFileSync(f, "utf8").split("\n")
  lines.forEach((l, i) => {
    if (/^\s*\d+\|/.test(l)) {
      console.log(f + " :: line " + (i + 1) + " :: " + JSON.stringify(l.slice(0, 60)))
    }
  })
}
