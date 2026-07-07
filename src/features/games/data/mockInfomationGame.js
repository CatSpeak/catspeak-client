const GAME_OPTIONS = [
  {
    id: "picture-it",
    title: "Picture IT",
    description: "Describe an image using the room language. Other players will rate your description.",
  },
  {
    id: "crack-it",
    title: "Crack IT",
    description: "Guess hidden words from hints before everyone else.",
  },
]

const DIFFICULTIES = [
  { id: "easy", label: "Easy", helper: "Great for a relaxed round." },
  { id: "medium", label: "Medium", helper: "Balanced for most players." },
  { id: "hard", label: "Hard", helper: "Best for experienced players." },
]

const LANGUAGES = [
  { id: "english", label: "English" },
  { id: "chinese", label: "Chinese" },
]

export { GAME_OPTIONS, DIFFICULTIES, LANGUAGES }