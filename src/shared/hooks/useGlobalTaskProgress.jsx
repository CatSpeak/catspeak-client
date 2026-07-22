import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentToken } from "@/store/slices/authSlice";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { updateUpload, addUpload } from "@/store/slices/globalUploadSlice";

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
      dispatch(
        updateUpload({
          id: task.taskId,
          updates: {
            title: task.title,
            status: "PROCESSING",
            progress: 80,
            stepName: task.stepName,
          },
        })
      );
    });

    connection.on("TaskProgressUpdated", (task) => {
      // Scale BE progress (0 - 100%) into the 80% - 100% range of the FE Progress Bar
      const bePercent = task.progressPercentage || 0;
      const scaledProgress = 80 + Math.round((bePercent / 100) * 20);

      dispatch(
        updateUpload({
          id: task.taskId,
          updates: {
            status: "PROCESSING",
            progress: Math.min(99, scaledProgress),
            stepName: task.stepName,
          },
        })
      );
    });

    connection.on("TaskCompleted", (task) => {
      dispatch(
        updateUpload({
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
        updateUpload({
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
              tasks.forEach((t) => {
                const bePercent = t.progressPercentage || 0;
                const scaledProgress = 80 + Math.round((bePercent / 100) * 20);
                dispatch(
                  addUpload({
                    id: t.taskId,
                    title: t.title,
                    status: "PROCESSING",
                    progress: Math.min(99, scaledProgress),
                    timestamp: new Date(t.startedAt).getTime(),
                    stepName: t.stepName,
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
