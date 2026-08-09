import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentToken } from "@/store/slices/authSlice";
import { HubConnectionBuilder, LogLevel, HttpTransportType } from "@microsoft/signalr";
import { updateTask, addTask } from "@/store/slices/globalTaskSlice";
import { useGetActiveUserTasksQuery } from "@/store/api/taskProgressApi";
import { store } from "@/store";

export const useGlobalTaskProgress = () => {
  const token = useSelector(selectCurrentToken);
  const tasks = useSelector((state) => state.globalTask.tasks);
  const dispatch = useDispatch();
  const connectionRef = useRef(null);

  // 1. Fetch active tasks from BE via RTK Query endpoint on startup / token change
  const { data: activeBackendTasks } = useGetActiveUserTasksQuery(undefined, {
    skip: !token,
  });

  // Restore active backend tasks into Redux store (F5 restore)
  useEffect(() => {
    if (!Array.isArray(activeBackendTasks) || activeBackendTasks.length === 0) return;

    const now = Date.now();
    activeBackendTasks.forEach((t) => {
      const startTime = t.startedAt ? new Date(t.startedAt).getTime() : now;
      // Ignore stale tasks older than 3 minutes
      const elapsed = Math.max(0, now - startTime);
      if (elapsed > 180000) return;

      const existingTask = store
        .getState()
        .globalTask.tasks.find((tk) => tk.id === t.taskId);

      if (!existingTask) {
        const initialProgress = Math.min(99, Math.floor((elapsed / 60000) * 99));

        dispatch(
          addTask({
            id: t.taskId,
            title: t.title,
            status: "PROCESSING",
            progress: initialProgress,
            timestamp: startTime,
            isUploadTask: false, // File bytes are ALREADY on server, no warning modal on refresh
            taskType: t.taskType,
          })
        );
      }
    });
  }, [activeBackendTasks, dispatch]);

  // 2. Smooth 60s progress simulation for active tasks in PROCESSING phase
  useEffect(() => {
    const activeTasks = tasks.filter(
      (t) => t.status === "UPLOADING" || t.status === "PROCESSING"
    );

    if (activeTasks.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      activeTasks.forEach((t) => {
        // Skip simulation if task is actively transferring file bytes over XHR
        if (t.status === "UPLOADING" && t.isUploadTask) return;

        const startTime = t.timestamp || now;
        const elapsed = Math.max(0, now - startTime);
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

  // 3. SignalR Connection & Real-time Task Completion/Failure events
  useEffect(() => {
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
    const hubUrl = `${baseUrl.replace(/\/api\/?$/, "")}/hubs/task-progress`;

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        transport:
          HttpTransportType.ServerSentEvents | HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
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

    connection.start().catch(() => {});

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [token, dispatch]);
};
