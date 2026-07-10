import React from 'react';
import { Gamepad2, LogOut, Menu } from 'lucide-react';
import { PillButton } from '@/shared/components/ui/buttons';
import { useLanguage } from '@/shared/context/LanguageContext';

const PictureItTopBar = ({
  roundNumber,
  totalRounds,
  describerName,
  isSpectator,
  isDescriber,
  onLeaveGame,
  onOpenSidebar
}) => {
  const { t } = useLanguage();
  const tb = t.rooms?.game?.pictureIt?.topBar || {};

  return (
    <div className="flex items-center justify-between border rounded-3xl px-2 py-2 md:px-4 md:py-2 bg-white shadow-sm gap-2">
      <div className="flex gap-2 md:gap-3 items-center shrink-0">
        <Gamepad2 className="text-cath-red-700 w-5 h-5 md:w-6 md:h-6" />
        <p className="text-cath-red-700 font-bold text-sm md:text-lg hidden sm:block">Picture IT</p>
      </div>

      <div className="flex gap-2 md:gap-4 shrink-0 overflow-hidden">
        <div className="flex gap-1 md:gap-2 font-bold border border-cath-red-700 w-fit px-2 py-1 md:px-4 md:py-1.5 rounded-3xl text-xs md:text-sm whitespace-nowrap">
          {tb.round || 'Round'}: <span className="font-semibold text-cath-red-700">{roundNumber}/{totalRounds || '?'}</span>
        </div>

        <div className="flex gap-1 md:gap-2 font-bold border border-cath-red-700 w-fit px-2 py-1 md:px-4 md:py-1.5 rounded-3xl text-xs md:text-sm whitespace-nowrap truncate max-w-[120px] md:max-w-[200px]">
          <span className="hidden sm:inline">{tb.describer || 'Describer'}: </span><span className="font-semibold text-cath-red-700 truncate">{describerName || 'Unknown'}</span>
        </div>
      </div>



      <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
        {isSpectator ? (
          <span className="text-[10px] md:text-xs font-semibold px-2 md:px-2.5 py-1 rounded-full border border-gray-400 text-gray-500 bg-gray-50">
            {tb.spectator || 'Spectator'}
          </span>
        ) : (
          <span
            className={`text-[10px] md:text-xs font-semibold px-2 md:px-2.5 py-1 rounded-full border ${isDescriber
              ? 'border-cath-red-700 text-cath-red-700 bg-cath-red-700/5'
              : 'border-[#f08d1d] text-[#f08d1d] bg-orange-50'
              }`}
          >
            {isDescriber ? (tb.roleDescriber || 'Describer') : (tb.roleRater || 'Rater')}
          </span>
        )}

        <button
          className="lg:hidden text-slate-500 hover:text-cath-red-600 hover:bg-red-50 p-1.5 rounded-full"
          onClick={onOpenSidebar}
        >
          <Menu size={20} />
        </button>

        <PillButton
          variant="outline"
          className="h-7 px-2 md:h-8 md:px-3 border-red-500 text-red-500 hover:bg-red-50 flex items-center justify-center font-bold"
          onClick={onLeaveGame}
        >
          <LogOut size={16} />
        </PillButton>
      </div>
    </div>
  );
};

export default PictureItTopBar;
