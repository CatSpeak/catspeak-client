import React from 'react';
import { Volume2, Trash2, GraduationCap, Link2, Calendar, Book } from 'lucide-react';
import IconButton from '@/shared/components/ui/buttons/IconButton';
import Divider from '@/shared/components/ui/Divider';
import { useLanguage } from '@/shared/context/LanguageContext';
import dayjs from 'dayjs';

const langMap = {
  English: 'EN',
  Chinese: 'ZH',
  Japanese: 'JA',
  Vietnamese: 'VI'
};

export const VocabularyListCard = ({ word, onPlayAudio, onDelete }) => {
  const { t } = useLanguage();
  const v = t.vocabularyNotebook?.card;

  const mappedLang = langMap[word.sourceLanguage] || word.sourceLanguage?.substring(0, 2).toUpperCase() || 'EN';
  const type = word.partOfSpeech || word.type;
  const ipa = word.phonetic || word.ipa;
  const example = word.exampleSentence || word.example;

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-border dark:border-[#3F3F3F] p-6 hover:shadow-faq-card transition-shadow">
      <div className="flex justify-between items-start gap-4">
        <div className='space-y-3 min-w-0 flex-1'>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{word.word}</h3>
            <div className='border border-[#D1D5DB] dark:border-[#3F3F3F] text-[#4B5563] dark:text-neutral-300 dark:bg-[#272727] text-xs uppercase px-2 py-0.5 font-semibold rounded'>
              {type ? (v?.[type] || type) : (v?.noun || 'Danh từ')}
            </div>
            <div className='bg-[#EFF6FF] dark:bg-blue-950/40 border border-[#BFDBFE] dark:border-blue-800 text-[#1D4ED8] dark:text-blue-300 text-xs uppercase px-2 py-0.5 font-semibold rounded'>{mappedLang}</div>
          </div>
          <div className="flex items-center gap-2">
            {ipa && <span className="text-[#4b5563] dark:text-neutral-300 font-mono text-sm px-2 py-1 bg-[#F3F4F6] dark:bg-[#272727] rounded-md">{ipa}</span>}
            <IconButton
              variant="outline"
              size="xs"
              onClick={() => onPlayAudio(word.word, mappedLang, word.audioUrl)}
            >
              <Volume2 className="w-4 h-4 text-[#990011] dark:text-red-400" />
            </IconButton>
          </div>
          <p className="text-lg font-medium text-gray-800 dark:text-neutral-100">{word.meaning}</p>
        </div>

        <IconButton
          variant="outline"
          size="xs"
          onClick={() => onDelete(word)}
        >
          <Trash2 className="w-5 h-5" />
        </IconButton>
      </div>

      {example && (
        <div className="bg-gray-50 dark:bg-[#242424] rounded-xl p-3 mb-4 text-[#1F2937] dark:text-neutral-200 italic border-l-4 border-primary mt-2">
          "{example}"
        </div>
      )}

      {(word.teacherNote || (word.relatedWords && word.relatedWords.length > 0)) && (
        <>
          <div className="flex flex-col gap-3">
            {word.teacherNote && (
              <div className="bg-[#fffcf1] dark:bg-amber-950/30 p-4 rounded-xl border-l-4 border-[#f59e0b] dark:border-amber-600">
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-5 h-5 text-[#92400E] dark:text-amber-400 shrink-0" />
                  <p className="text-sm font-bold text-[#92400E] dark:text-amber-400 uppercase">{v?.teacherNote || 'Ghi chú từ giáo viên'}</p>
                </div>
                <p className="text-sm text-[#451A03] dark:text-amber-200">{word.teacherNote}</p>
              </div>
            )}

            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
              {word.relatedWords && word.relatedWords.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className="text-sm text-[#9CA3AF] dark:text-neutral-400 mr-1">{v?.relatedWords || 'Từ liên quan:'}</span>
                  {word.relatedWords.map((related, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-[#F3F4F6] dark:bg-[#272727] rounded-md text-sm text-[#4B5563] dark:text-neutral-300 font-medium"
                    >
                      {related}
                    </span>
                  ))}
                </div>
              )}

              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1'>
                  <Book className="w-4 h-4 text-primary dark:text-red-400 shrink-0" />
                  <span className="text-sm text-[#6B7280] dark:text-neutral-400 font-medium">{v?.scriptLabel || 'Script:'} {word.scriptName || (word.scriptId ? `Script ${word.scriptId}` : 'Tương tác từ vựng')}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-[#9CA3AF] font-medium">
                  <Calendar className='w-4 h-4 text-[#9CA3AF]' />
                  <span>{word.createdAt ? dayjs(word.createdAt).format('DD/MM/YYYY') : '15/09/2026'}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
