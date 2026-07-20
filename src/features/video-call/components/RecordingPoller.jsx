import { useEffect } from "react";
import { useGlobalUpload } from "@/shared/hooks/useGlobalUpload.jsx";
import { useGetMyRecordingsQuery } from "@/store/api/recordingsApi";

export const RecordingPoller = () => {
  const { uploads, updateCustomTask } = useGlobalUpload();
  
  const processingRecordings = uploads.filter(
    (u) => u.isRecording && u.status === "PROCESSING"
  );

  // 1. Auto-increment progress for processing recordings smoothly
  useEffect(() => {
    if (processingRecordings.length === 0) return;

    const interval = setInterval(() => {
      processingRecordings.forEach((rec) => {
        let nextProgress = rec.progress || 0;
        if (nextProgress < 50) {
          nextProgress += 2;
        } else if (nextProgress < 85) {
          nextProgress += 1;
        } else if (nextProgress < 95) {
          nextProgress += 0.5;
        } else if (nextProgress < 99) {
          nextProgress += 0.1;
        }
        
        updateCustomTask(rec.id, { progress: parseFloat(nextProgress.toFixed(1)) });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [processingRecordings, updateCustomTask]);

  // 2. Poll DB to verify recording completion
  const { data: dbRecordings = [] } = useGetMyRecordingsQuery(undefined, {
    skip: processingRecordings.length === 0,
    pollingInterval: 5000,
  });

  // Check completions
  useEffect(() => {
    if (processingRecordings.length === 0 || dbRecordings.length === 0) return;

    processingRecordings.forEach((rec) => {
      const match = dbRecordings.find(
        (dbRec) => dbRec.egressId === rec.id
      );
      if (match) {
        if (rec.progress < 100) {
          updateCustomTask(rec.id, { progress: 100 });
          setTimeout(() => {
            updateCustomTask(rec.id, { status: "SUCCESS" });
          }, 500);
        }
      }
    });
  }, [dbRecordings, processingRecordings, updateCustomTask]);

  return null; // Headless component
};

export default RecordingPoller;
