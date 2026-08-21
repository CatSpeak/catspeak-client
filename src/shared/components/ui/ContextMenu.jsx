import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const ContextMenu = ({ isOpen, position, options, onClose }) => {
  const menuRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const { innerWidth, innerHeight } = window;
      const { offsetWidth, offsetHeight } = menuRef.current;

      let newX = position.x;
      let newY = position.y;

      if (position.x + offsetWidth > innerWidth) {
        newX = position.x - offsetWidth;
      }
      if (position.y + offsetHeight > innerHeight) {
        newY = position.y - offsetHeight;
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [isOpen, position]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-xl shadow-lg border border-[#E3BEBA] py-2 min-w-[200px]"
      style={{ top: adjustedPosition.y, left: adjustedPosition.x }}
      onClick={(e) => e.stopPropagation()}
    >
      {options.map((option, index) => (
        <button
          key={index}
          className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-[#F9F9F9] transition-colors ${option.disabled ? 'text-gray-400 cursor-not-allowed' : option.danger ? 'text-red-500 hover:text-red-600' : 'text-[#1A1C1C]'
            }`}
          onClick={(e) => {
            e.stopPropagation();
            if (option.disabled) return;
            if (option.onClick) option.onClick();
            onClose();
          }}
        >
          {option.icon && <span className="text-current opacity-80">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>,
    document.body
  );
};

export default ContextMenu;
