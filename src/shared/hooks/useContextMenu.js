import { useState, useCallback, useEffect } from 'react';

export const useContextMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling to document's closeContextMenu listener
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  }, []);

  const closeContextMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Use setTimeout to avoid the current bubbling event triggering the listener immediately
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', closeContextMenu);
        document.addEventListener('contextmenu', closeContextMenu);
      }, 0);
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', closeContextMenu);
        document.removeEventListener('contextmenu', closeContextMenu);
      };
    }
  }, [isOpen, closeContextMenu]);

  return {
    isOpen,
    position,
    handleContextMenu,
    closeContextMenu
  };
};
