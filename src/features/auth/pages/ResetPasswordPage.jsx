import { motion } from "framer-motion"
import { FiUsers, FiCpu, FiMessageCircle } from "react-icons/fi"
import { useRoomsPageLogic } from "@/features/rooms"


const ResetPasswordPage = () => {
  const { state, actions } = useRoomsPageLogic()
  const { isCreatingOneOnOne, isCreatingStudyGroup } = state
  const { handleCreateOneOnOneSession, handleCreateStudyGroupSession } = actions

  const cards = [
    {
      key: "one-on-one",
      title: "Talk 1:1",
      description: "Quick conversation with a random partner.",
      icon: FiMessageCircle,
      action: handleCreateOneOnOneSession,
      loading: isCreatingOneOnOne,
    },
    {
      key: "group",
      title: "Study Group",
      description: "Host a room for up to 5 people.",
      icon: FiUsers,
      action: handleCreateStudyGroupSession,
      loading: isCreatingStudyGroup,
    },
    {
      key: "ai",
      title: "Practice with AI",
      description: "Chat privately with an AI tutor.",
      icon: FiCpu,
      action: () => {}, // Placeholder
      disabled: true,
    },
  ]

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center overflow-hidden px-4">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Main Central Blob */}
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-orange-100 to-red-100 opacity-80 blur-[60px]" />

        {/* Top Left Blob */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 opacity-60 blur-[50px]" />

        {/* Bottom Right Blob */}
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-red-100 to-pink-100 opacity-60 blur-[60px]" />

        {/* Small Floating Elements */}
        <div className="absolute left-[10%] top-[20%] h-4 w-4 rounded-full bg-red-400/20 blur-[1px]" />
        <div className="absolute right-[15%] top-[15%] h-6 w-6 rounded-full bg-orange-400/20 blur-[2px]" />
        <div className="absolute left-[20%] bottom-[20%] h-8 w-8 rounded-full bg-yellow-400/10 blur-[4px]" />
        <div className="absolute right-[25%] bottom-[30%] h-5 w-5 rounded-full bg-pink-400/20 blur-[1px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-12 text-center"
      >
        <h1 className="mb-4 text-4xl font-black tracking-tight text-gray-900 md:text-6xl">
          Start Speaking <span className="text-[#990011]">Now</span>
        </h1>
        <p className="text-lg text-gray-600 md:text-xl">
          Choose your preferred way to practice English.
        </p>
      </motion.div>

      <div className="relative z-10 grid w-full max-w-5xl gap-6 md:grid-cols-3">
        {cards.map((card, idx) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="h-full"
            >
              <div
                onClick={!card.disabled ? card.action : undefined}
                className={`group flex h-full flex-col justify-between overflow-hidden rounded-[2rem] border-2 p-8 transition-colors duration-300 ${
                  card.disabled
                    ? "cursor-not-allowed border-gray-100 opacity-60 bg-white"
                    : "cursor-pointer border-gray-200 bg-white hover:border-[#990011]"
                }`}
              >
                <div>
                  <div
                    className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${
                      card.disabled
                        ? "bg-gray-200 text-gray-400"
                        : "bg-[#990011] text-white"
                    }`}
                  >
                    {card.loading ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Icon className="h-7 w-7" />
                    )}
                  </div>

                  <h3
                    className={`mb-2 text-2xl font-bold transition-colors ${
                      !card.disabled
                        ? "group-hover:text-[#990011]"
                        : "text-gray-800"
                    }`}
                  >
                    {card.title}
                  </h3>
                  <p className="text-gray-500 font-medium">
                    {card.description}
                  </p>
                </div>

                {!card.disabled && (
                  <div className="mt-8 flex w-full justify-end">
                    <div className="rounded-full overflow-hidden p-2 transition-all duration-300 group-hover:bg-[#990011]/10 group-hover:translate-x-2">
                      <svg
                        className="h-6 w-6 text-gray-400 transition-colors group-hover:text-[#990011]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default ResetPasswordPage
