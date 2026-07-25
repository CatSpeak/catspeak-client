import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentToken } from "@/store/slices/authSlice";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { updateTask, addTask } from "@/store/slices/globalTaskSlice";
import { store } from "@/store";

export const useGlobalTaskProgress = () => {
  const token = useSelector(selectCurrentToken);
  const tasks = useSelector((state) => state.globalTask.tasks);
  const dispatch = useDispatch();
  const connectionRef = useRef(null);

  // 1. Smooth 60s progress simulation for active tasks (0% -> 99% in 60,000ms)
  useEffect(() => {
    const activeTasks = tasks.filter(
      (t) => t.status === "UPLOADING" || t.status === "PROCESSING"
    );

    if (activeTasks.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      activeTasks.forEach((t) => {
        const startTime = t.timestamp || now;
        const elapsed = now - startTime;
        // Calculate smooth progress capping out at 99%
        const targetProgress = Math.min(99, Math.floor((elapsed / 60000) * 99));

        if (targetProgress > (t.progress || 0)) {
          dispatch(
            updateTask({
              id: t.id,
              updates: { progress: targetProgress },
            })
          );
        }
      });
    }, 400);

    return () => clearInterval(interval);
  }, [tasks, dispatch]);

  // 2. SignalR Connection & Real-time Task Completion/Failure events
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
        // Fetch active tasks from BE Cache on startup (F5 restore)
        fetch(`${baseUrl}/TaskProgress/active`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((backendTasks) => {
            if (Array.isArray(backendTasks)) {
              const now = Date.now();
              backendTasks.forEach((t) => {
                const startTime = t.startedAt
                  ? new Date(t.startedAt).getTime()
                  : now;
                // Ignore stale tasks older than 3 minutes
                if (now - startTime > 180000) return;

                const existingTask = store
                  .getState()
                  .globalTask.tasks.find((tk) => tk.id === t.taskId);

                if (!existingTask) {
                  const elapsed = now - startTime;
                  const initialProgress = Math.min(99, Math.floor((elapsed / 60000) * 99));

                  dispatch(
                    addTask({
                      id: t.taskId,
                      title: t.title,
                      status: "PROCESSING",
                      progress: initialProgress,
                      timestamp: startTime,
                      isUploadTask: true,
                      taskType: t.taskType,
                    })
                  );
                }
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
