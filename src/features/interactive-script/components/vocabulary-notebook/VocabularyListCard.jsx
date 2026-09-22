import React from 'react';
import { Volume2, Trash2, GraduationCap, Link2, Calendar, Book } from 'lucide-react';
import IconButton from '@/shared/components/ui/buttons/IconButton';
import Divider from '@/shared/components/ui/Divider';
import { useLanguage } from '@/shared/context/LanguageContext';

export const VocabularyListCard = ({ word, onPlayAudio, onDelete }) => {
  const { t } = useLanguage();
  const v = t.vocabularyNotebook?.card;

  return (
    <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-faq-card transition-shadow">
      <div className="flex justify-between items-start">
        <div className='space-y-3'>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">{word.word}</h3>
            <div className='border border-[#D1D5DB] text-[#4B5563] text-xs uppercase px-2 py-0.5 font-semibold rounded'>
              {word.type ? (v?.[word.type] || word.type) : (v?.noun || 'Danh từ')}
            </div>
            <div className='bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs uppercase px-2 py-0.5 font-semibold rounded'>{word.language?.toUpperCase() || 'EN'}</div>
          </div>
          <div className="flex items-center gap-2">
            {word.ipa && <span className="text-[#4b5563] font-mono text-sm px-2 py-1 bg-[#F3F4F6] rounded-md">{word.ipa}</span>}
            <IconButton
              variant="outline"
              size="xs"
              onClick={() => onPlayAudio(word.word, word.language, word.audioUrl)}
            >
              <Volume2 className="w-4 h-4 text-[#990011]" />
            </IconButton>
          </div>
          <p className="text-lg font-medium">{word.meaning}</p>
        </div>

        <IconButton
          variant="outline"
          size="xs"
          onClick={() => onDelete(word)}
        >
          <Trash2 className="w-5 h-5" />
        </IconButton>
      </div>

      {word.example && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-[#1F2937] italic border-l-4 border-primary mt-2">
          "{word.example}"
        </div>
      )}

      {(word.teacherNote || (word.relatedWords && word.relatedWords.length > 0)) && (
        <>
          <div className="flex flex-col gap-3">
            {word.teacherNote && (
              <div className="bg-[#fffcf1] p-4 rounded-xl border-l-4 border-[#f59e0b]">
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-5 h-5 text-[#92400E] shrink-0" />
                  <p className="text-sm font-bold text-[#92400E] uppercase">{v?.teacherNote || 'Ghi chú từ giáo viên'}</p>
                </div>
                <p className="text-sm text-[#451A03]">{word.teacherNote}</p>
              </div>
            )}

            <div className='flex items-center justify-between'>
              {word.relatedWords && word.relatedWords.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className="text-sm text-[#9CA3AF] mr-1">{v?.relatedWords || 'Từ liên quan:'}</span>
                  {word.relatedWords.map((related, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-[#F3F4F6] rounded-md text-sm text-[#4B5563] font-medium"
                    >
                      {related}
                    </span>
                  ))}
                </div>
              )}

              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1'>
                  <Book className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-[#6B7280] font-medium">{v?.scriptLabel || 'Script:'} {word.scriptName || 'Happy Halloween'}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-[#9CA3AF] font-medium">
                  <Calendar className='w-4 h-4 text-[#9CA3AF]' />
                  <span>15/09/2026</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
