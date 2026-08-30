import { useRef, useCallback } from 'react';

export const useLongPress = ({ isSelectionMode, onToggleSelect, onClick }) => {
  const timerRef = useRef(null);
  const isLongPressRef = useRef(false);

  const handlePointerDown = useCallback((e) => {
    if (e.button !== 0 && e.button !== undefined) return;
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (!isSelectionMode && onToggleSelect) {
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(50);
        }
        onToggleSelect();
      }
    }, 500);
  }, [isSelectionMode, onToggleSelect]);

  const handlePointerUp = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleClick = useCallback((e) => {
    if (isLongPressRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.ctrlKey || e.metaKey || isSelectionMode) {
      e.preventDefault();
      e.stopPropagation();
      onToggleSelect && onToggleSelect();
    } else {
      onClick && onClick(e);
    }
  }, [isSelectionMode, onToggleSelect, onClick]);

  const handleContextMenu = useCallback((e) => {
    if (isLongPressRef.current || isSelectionMode) {
      e.preventDefault();
    }
  }, [isSelectionMode]);

  return {
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
      onClick: handleClick,
      onContextMenu: handleContextMenu,
    }
  };
};

export default useLongPress;
