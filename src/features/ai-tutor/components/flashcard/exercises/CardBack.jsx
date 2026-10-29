import React from "react"

/** Mặt sau chung của thẻ: chữ Hán, pinyin, nghĩa, loại từ, câu ví dụ. */
const CardBack = ({ card, highlight = true }) => {
  const sentence = card.example_sentence
  const parts = sentence && card.word && highlight ? sentence.split(card.word) : null

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="text-4xl sm:text-5xl font-semibold text-slate-900" lang="zh">
        {card.word}
      </div>
      {card.pinyin && <div className="text-base text-slate-600">{card.pinyin}</div>}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
        <span className="text-lg font-medium text-slate-800">{card.meaning_vi || "Chưa có nghĩa"}</span>
        {card.part_of_speech_vi && (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            {card.part_of_speech_vi}
          </span>
        )}
      </div>
      {sentence && (
        <p className="mt-2 max-w-md rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-base text-slate-700" lang="zh">
          {parts
            ? parts.map((p, i) => (
                <React.Fragment key={i}>
                  {p}
                  {i < parts.length - 1 && <strong className="text-[#990011]">{card.word}</strong>}
                </React.Fragment>
              ))
            : sentence}
        </p>
      )}
    </div>
  )
}

export default CardBack
