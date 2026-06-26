import { Element2, Element3, Element5, Element6 } from "@/features/landing/assets/index.jsx";
import { useLanguage } from "@/shared/context/LanguageContext.jsx";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
const FAQSection = () => {
  const { t } = useLanguage();
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  // Handle question expansion - Independent toggle for each question
  const toggleQuestion = (index) => {
    console.log(Element5);
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="relative w-full px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-24 overflow-visible">
      <img
        src={Element6}
        alt=""
        aria-hidden="true"
        className="absolute -bottom-5 -left-1 w-[800px] md:w-[1000px] lg:w-[1200px] opacity-70 pointer-events-none select-none z-10"
      />
      <div className="mx-auto max-w-screen-xl relative z-10 px-0 sm:px-4">
        {/* Main Background Container */}
        <div className="relative rounded-l-[40px] rounded-r-[0px] md:rounded-r-[40px] border border-gray-300 md:border-r-0 lg:border-r bg-[#FFEDEB] overflow-visible min-h-[500px]">
          {/* Inner Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 md:p-12 lg:p-16 h-full relative z-20">
            {/* Left Column: Titles and Description */}
            <div className="lg:col-span-5 flex flex-col">
              <h3 className="text-[#A8001D] font-black text-xl md:text-2xl uppercase tracking-widest mb-1">
                {t.faq.corner}
              </h3>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-black mb-4">
                {t.faq.title}
              </h2>
              <p className="text-gray-600 text-sm md:text-base max-w-sm">
                {t.faq.description}
              </p>

              {/* Cat Decorative Element (if any) or line */}
              {/* <div className="mt-auto hidden md:block">
                <img
                  src={FAQDecorations}
                  alt="FAQ Decorations"
                  className="w-[200px] md:w-[250px] opacity-70 object-contain"
                />
              </div> */}
              <div className="hidden lg:flex flex-1 items-end pt-10">
                <img
                  src={Element3}
                  alt=""
                  aria-hidden="true"
                  className="w-72 opacity-70 pointer-events-none select-none"
                />
              </div>
            </div>

            {/* Right Column: Accordion */}
            <div className="md:col-span-7 flex flex-col">
              {t.faq.questions &&
                t.faq.questions.map((item, originalIndex) => {
                  const isExpanded = expandedQuestions.has(originalIndex);

                  return (
                    <div
                      key={originalIndex}
                      className="border-b border-[#E6C6C6] last:border-b-0 py-4 block transition-all"
                    >
                      <button
                        aria-controls={`panel${originalIndex}-content`}
                        id={`panel${originalIndex}-header`}
                        onClick={() => toggleQuestion(originalIndex)}
                        className="flex w-full items-center justify-between outline-none pb-2 pt-2 group"
                      >
                        <span className="flex-1 text-base md:text-lg font-medium text-black text-left pr-4 transition-colors group-hover:text-[#A8001D]">
                          {item.question}
                        </span>

                        <div className="ml-2 flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-colors relative">
                          {isExpanded ? (
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                              <Minus className="w-5 h-5 text-gray-500" />
                            </div>
                          ) : (
                            <div className="w-full h-full rounded-full bg-[#990011] flex items-center justify-center">
                              <Plus className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                      </button>

                      <div
                        className={`transition-all overflow-hidden ${isExpanded ? "block mt-4 mb-2" : "hidden"}`}
                      >
                        <div className="bg-[#990011] rounded-2xl rounded-tr-sm p-5 md:p-6 text-sm md:text-base leading-relaxed text-white text-left shadow-lg">
                          {item.answer.split("\n").map((line, idx) => (
                            <span key={idx}>
                              {line}
                              {idx < item.answer.split("\n").length - 1 && (
                                <br />
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="lg:hidden flex justify-center mt-8">
              <img
                src={Element3}
                alt=""
                aria-hidden="true"
                className="  opacity-70 pointer-events-none select-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
