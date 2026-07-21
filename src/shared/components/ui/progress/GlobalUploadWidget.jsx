import React, { useState, useEffect } from "react";
import { useLanguage } from "@/shared/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Loader2, ChevronDown, ChevronUp, ListTodo } from "lucide-react";
import { useGlobalUpload } from "@/shared/hooks/useGlobalUpload.jsx";

const UploadItem = ({ upload, onCancel, onRemove }) => {
  const { t } = useLanguage();
  const [displayProgress, setDisplayProgress] = useState(upload.progress);

  // Fake progress logic for PROCESSING state
  useEffect(() => {
    let interval;
    if (upload.status === "PROCESSING") {
      // It starts at 80, we want it to creep up to 99 over time
      interval = setInterval(() => {
        setDisplayProgress((prev) => {
          if (prev >= 99) {
            clearInterval(interval);
            return 99;
          }
          // Increment slowly, slowing down as it gets closer to 99
          const increment = Math.max(0.5, (99 - prev) * 0.05);
          return Math.min(99, prev + increment);
        });
      }, 1000);
    } else {
      setDisplayProgress(upload.progress);
    }
    return () => clearInterval(interval);
  }, [upload.status, upload.progress]);

  const isSuccess = upload.status === "SUCCESS";
  const isError = upload.status === "ERROR";
  const isCanceled = upload.status === "CANCELED";
  const isDone = isSuccess || isError || isCanceled;

  // Auto remove success/error items after 5 seconds
  useEffect(() => {
    if (isDone) {
      const timer = setTimeout(() => {
        onRemove(upload.id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isDone, upload.id, onRemove]);

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0">
            {isSuccess ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : isError || isCanceled ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Loader2 className="w-5 h-5 text-cath-red-700 animate-spin" />
            )}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm font-medium text-gray-900 truncate">
              {upload.title}
            </span>
            <span className="text-xs text-gray-500">
              {isSuccess
                ? t?.uploadWidget?.success
                : isError
                ? t?.uploadWidget?.error
                : isCanceled
                ? t?.uploadWidget?.cancelTip
                : upload.status === "PROCESSING"
                ? t?.uploadWidget?.processing?.replace("{{progress}}", Math.floor(displayProgress))
                : t?.uploadWidget?.uploading?.replace("{{progress}}", Math.floor(displayProgress))}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => isDone ? onRemove(upload.id) : onCancel(upload.id)}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
          title={t?.uploadWidget?.cancelTip}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${displayProgress}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full rounded-full ${isSuccess ? "bg-green-500" : isError || isCanceled ? "bg-red-500" : "bg-cath-red-700"}`}
        />
      </div>
    </div>
  );
};

export const GlobalUploadWidget = () => {
  const { uploads, cancelUpload, removeUpload } = useGlobalUpload();
  const { t } = useLanguage();
  const [isMinimized, setIsMinimized] = useState(false);

  const visibleUploads = uploads ? uploads.filter((u) => !u.isHidden) : [];

  // If there are no visible uploads, don't show the widget
  if (visibleUploads.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed z-[9999] bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 w-auto sm:w-80 rounded-xl shadow-2xl border border-gray-100 backdrop-blur-xl bg-white/90 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div 
          onClick={() => setIsMinimized(!isMinimized)}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-cath-red-700" />
            <span className="font-semibold text-gray-900 text-sm">
              {t?.uploadWidget?.itemsCount?.replace("{{count}}", visibleUploads.length)}
            </span>
          </div>
          <button className="text-gray-500 hover:text-gray-700">
            {isMinimized ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Upload List */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 flex flex-col gap-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                {visibleUploads.map((upload) => (
                  <UploadItem 
                    key={upload.id} 
                    upload={upload} 
                    onCancel={cancelUpload}
                    onRemove={removeUpload}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalUploadWidget;
