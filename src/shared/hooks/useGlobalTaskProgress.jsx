import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentToken } from "@/store/slices/authSlice";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { updateTask, addTask } from "@/store/slices/globalTaskSlice";
import { store } from "@/store";

export const useGlobalTaskProgress = () => {
  const token = useSelector(selectCurrentToken);
  const dispatch = useDispatch();
  const connectionRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
    const hubUrl = `${baseUrl.replace(/\/api\/?$/, "")}/hubs/task-progress`;

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    connection.on("TaskStarted", (task) => {
      const existingTask = store.getState().globalTask.tasks.find((t) => t.id === task.taskId);
      const isUpload = existingTask?.isUploadTask;
      const bePercent = task.progressPercentage || 0;

      const progress = isUpload
        ? 50 + Math.round((bePercent / 100) * 50)
        : bePercent;

      dispatch(
        updateTask({
          id: task.taskId,
          updates: {
            title: task.title,
            status: "PROCESSING",
            progress: Math.min(99, progress),
            stepName: task.stepName,
          },
        })
      );
    });

    connection.on("TaskProgressUpdated", (task) => {
      const existingTask = store.getState().globalTask.tasks.find((t) => t.id === task.taskId);
      const isUpload = existingTask?.isUploadTask;
      const bePercent = task.progressPercentage || 0;

      // 0-50% is reserved for client file upload; 50-100% is for server background processing
      // Pure server tasks run directly from 0-100%
      const calculatedProgress = isUpload
        ? 50 + Math.round((bePercent / 100) * 50)
        : bePercent;

      dispatch(
        updateTask({
          id: task.taskId,
          updates: {
            status: "PROCESSING",
            progress: Math.min(99, calculatedProgress),
            stepName: task.stepName,
          },
        })
      );
    });

    connection.on("TaskCompleted", (task) => {
      dispatch(
        updateTask({
          id: task.taskId,
          updates: {
            status: "SUCCESS",
            progress: 100,
            completionTime: Date.now(),
            payload: task.payload,
          },
        })
      );
    });

    connection.on("TaskFailed", (task) => {
      dispatch(
        updateTask({
          id: task.taskId,
          updates: {
            status: "ERROR",
            progress: 100,
            completionTime: Date.now(),
            error: task.errorMessage || "Tác vụ thất bại",
          },
        })
      );
    });

    connection
      .start()
      .then(() => {
        // Fetch active tasks from BE Cache on startup (multi-device sync and F5 restore)
        fetch(`${baseUrl}/TaskProgress/active`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((tasks) => {
            if (Array.isArray(tasks)) {
              const now = Date.now();
              tasks.forEach((t) => {
                const startTime = t.startedAt ? new Date(t.startedAt).getTime() : now;
                // Ignore stale tasks older than 3 minutes
                if (now - startTime > 180000) return;

                const existingTask = store.getState().globalTask.tasks.find((tk) => tk.id === t.taskId);
                const isUpload = existingTask?.isUploadTask || t.taskType?.includes("Upload") || t.taskType?.includes("Reel");
                const bePercent = t.progressPercentage || 0;

                const calculatedProgress = isUpload
                  ? 50 + Math.round((bePercent / 100) * 50)
                  : bePercent;

                dispatch(
                  addTask({
                    id: t.taskId,
                    title: t.title,
                    status: "PROCESSING",
                    progress: Math.min(99, calculatedProgress),
                    timestamp: startTime,
                    stepName: t.stepName,
                    isUploadTask: isUpload,
                  })
                );
              });
            }
          })
          .catch(() => {});
      })
      .catch(() => {});

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [token, dispatch]);
};
