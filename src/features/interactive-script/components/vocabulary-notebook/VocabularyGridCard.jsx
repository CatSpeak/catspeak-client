import React, { useState } from 'react';
import { Volume2, Trash2, ChevronDown, ChevronUp, Book, Calendar, GraduationCap } from 'lucide-react';
import IconButton from '@/shared/components/ui/buttons/IconButton';
import { useLanguage } from '@/shared/context/LanguageContext';

export const VocabularyGridCard = ({ word, onPlayAudio, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();
  const v = t.vocabularyNotebook?.card;

  const hasExtraContent = word.example || word.teacherNote || (word.relatedWords && word.relatedWords.length > 0);

  return (
    <div className="bg-white rounded-2xl border border-border p-4 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="space-y-1">
        <div className='flex items-center justify-between'>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{word.word}</h3>
            <div className='bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs uppercase px-2 py-0.5 font-semibold rounded'>{word.language?.toUpperCase() || 'EN'}</div>
          </div>
          <IconButton
            variant="ghost"
            size="xs"
            onClick={() => onDelete(word)}
          >
            <Trash2 className="w-5 h-5" />
          </IconButton>
        </div>

        <div className="flex items-center gap-1">
          {word.ipa && <span className="text-[#6B7280] font-mono">{word.ipa}</span>}
          <IconButton
            variant="ghost"
            size="xs"
            onClick={() => onPlayAudio(word.word, word.language, word.audioUrl)}
          >
            <Volume2 className="w-4 h-4 text-[#990011]" />
          </IconButton>
        </div>
        <div className='bg-[#F3F4F6] border border-[#D1D5DB] text-[#4B5563] text-xs uppercase px-2 py-0.5 font-semibold rounded w-fit max-w-fit min-w-0'>
          {word.type ? (v?.[word.type] || word.type) : (v?.noun || 'Danh từ')}
        </div>
      </div>

      <p className="font-medium text-[#4B5563] mt-2 line-clamp-3 mb-3">{word.meaning}</p>

      <div className="">
        {hasExtraContent && (
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1'>
                <Book className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs text-[#9CA3AF] font-medium">{v?.scriptLabel || 'Script:'} {word.scriptName || 'Happy Halloween'}</span>
              </div>
            </div>

            <button
              className="text-xs text-primary font-medium flex items-center gap-1 transition-colors"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (v?.collapse || 'Thu gọn') : (v?.expand || 'Chi tiết')}
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}

        {expanded && hasExtraContent && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-3">
            {word.example && (
              <div className="text-sm bg-gray-50 rounded-xl p-2 text-[#1F2937] italic border-l-4 border-primary">
                "{word.example}"
              </div>
            )}

            {word.teacherNote && (
              <div className="bg-[#fffcf1] p-2 rounded-xl border-l-4 border-[#f59e0b]">
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4 text-[#92400E] shrink-0" />
                  <p className="text-xs font-semibold text-orange-700 mb-1">{v?.teacherNote || 'Ghi chú từ giáo viên'}</p>
                </div>
                <p className="text-xs text-gray-700">{word.teacherNote}</p>
              </div>
            )}

            {word.relatedWords && word.relatedWords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {word.relatedWords.map((related, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-[#F3F4F6] rounded-md text-xs text-[#4B5563] font-medium"
                  >
                    {related}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
