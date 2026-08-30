import React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { FluentAnimation } from "@/shared/components/ui/animations";
import LanguageSwitcher from "@/shared/components/ui/LanguageSwitcher";
import MobileNavLinks from "./MobileNavLinks";
import useScrollLock from "@/shared/hooks/useScrollLock";
import { X } from "lucide-react";

const MobileDrawer = ({ open, onClose }) => {
  useScrollLock(open);

  return createPortal(
    <div className="fixed inset-0 z-[2000] lg:hidden pointer-events-none">
      {/* Backdrop - renders instantly and unmounts instantly */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer - animates in and out */}
      <AnimatePresence>
        {open && (
          <FluentAnimation
            direction="right"
            distance="100%"
            exit={true}
            className="fixed inset-y-0 left-0 z-[101] w-full min-[426px]:w-[320px] h-full pointer-events-auto text-black"
          >
            <aside className="w-full h-full bg-white overflow-y-auto">
              <div className="flex flex-col p-5 text-gray-800">
                {/* Header: Close Button & Language Switcher */}
                <div className="flex justify-between items-center mb-5">
                  <button
                    onClick={onClose}
                    className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X />
                  </button>
                  <LanguageSwitcher />
                </div>

                {/* Navigation Links — mirrors DesktopNav */}
                <MobileNavLinks onClose={onClose} />
              </div>
            </aside>
          </FluentAnimation>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
};

export default MobileDrawer;
