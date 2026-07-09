import React from 'react';
import { Gamepad2, LogOut } from 'lucide-react';
import { PillButton } from '@/shared/components/ui/buttons';

const PictureItTopBar = ({
  roundNumber,
  totalRounds,
  gameLanguage,
  isSpectator,
  isDescriber,
  onLeaveGame
}) => {
  return (
    <div className="flex items-center justify-between border rounded-3xl px-4 py-2 bg-white shadow-sm">
      <div className="flex gap-3 items-center">
        <Gamepad2 className="text-cath-red-700" />
        <p className="text-cath-red-700 font-bold text-lg">Picture IT</p>
      </div>

      <div className="flex gap-4">
        <div className="flex gap-2 font-bold border border-cath-red-700 w-fit px-4 py-1.5 rounded-3xl text-sm">
          Round: <span className="font-semibold text-cath-red-700">{roundNumber}/{totalRounds || '?'}</span>
        </div>
      </div>

      <div className="flex gap-2 font-bold border border-cath-red-700 w-fit px-4 py-1.5 rounded-3xl text-sm">
        Language: <span className="font-semibold text-cath-red-700">{gameLanguage}</span>
      </div>

      <div className="flex items-center gap-4">
        {isSpectator ? (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-400 text-gray-500 bg-gray-50">
            Spectator
          </span>
        ) : (
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isDescriber
              ? 'border-cath-red-700 text-cath-red-700 bg-cath-red-700/5'
              : 'border-[#f08d1d] text-[#f08d1d] bg-orange-50'
              }`}
          >
            {isDescriber ? 'Describer' : 'Rater'}
          </span>
        )}

        <PillButton
          variant="outline"
          className="h-8 px-3 border-red-500 text-red-500 hover:bg-red-50 text-xs flex items-center gap-1.5 font-bold"
          onClick={onLeaveGame}
          startIcon={<LogOut size={13} />}
        >
          Leave Game
        </PillButton>
      </div>
    </div>
  );
};

export default PictureItTopBar;
