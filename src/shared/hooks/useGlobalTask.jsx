import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentToken } from "@/store/slices/authSlice";
import {
  selectGlobalTasks,
  setTasks,
  addTask,
  updateTask,
  removeTask as removeTaskAction,
  revealTask as revealTaskAction,
  selectIsConfirmingReload,
  setConfirmingReload,
  clearTasks,
} from "@/store/slices/globalTaskSlice";
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal";
import { useLanguage } from "@/shared/context/LanguageContext";

// Registry lưu vết các XMLHttpRequest đang chạy
const taskRegistry = new Map();

/**
 * Custom Hook quản lý tác vụ upload / background task toàn cục.
 */
export const useGlobalTask = () => {
  const tasks = useSelector(selectGlobalTasks);
  const token = useSelector(selectCurrentToken);
  const dispatch = useDispatch();

  const uploadFile = useCallback(
    ({ url, method = "POST", data, title, isHidden = false, onUploadSuccess, onUploadError }) => {
      const id = Math.random().toString(36).substring(7) + Date.now();

      // Automatically attach TaskId to FormData if available for BE progress tracking sync
      if (data instanceof FormData && !data.has("TaskId")) {
        data.append("TaskId", id);
      }

      const newTask = {
        id,
        title,
        progress: 0,
        status: "UPLOADING", // 'UPLOADING', 'PROCESSING', 'SUCCESS', 'ERROR'
        timestamp: Date.now(),
        isHidden,
        isUploadTask: true,
      };

      dispatch(addTask(newTask));

      const xhr = new XMLHttpRequest();
      taskRegistry.set(id, { xhr });

      const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
      const finalUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

      xhr.open(method, finalUrl, true);

      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      const match = window.location.pathname.match(/^\/([a-z]{2})(?:\/|$)/i);
      if (match) {
        xhr.setRequestHeader("X-Community-Lang", match[1]);
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const rawProgress = Math.round((e.loaded / e.total) * 100);
          // Scale client upload byte progress into 0% - 50% range of the single continuous bar
          const uploadProgress = Math.round((rawProgress / 100) * 50);
          dispatch(
            updateTask({
              id,
              updates: {
                status: "UPLOADING",
                progress: Math.min(49, uploadProgress),
                stepName: "UPLOADING_FILE",
                isUploadTask: true,
              },
            })
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          dispatch(
            updateTask({
              id,
              updates: {
                status: "SUCCESS",
                progress: 100,
                completionTime: Date.now(),
              },
            })
          );
          taskRegistry.delete(id);
          if (onUploadSuccess) {
            let responseData = xhr.responseText;
            try {
              responseData = JSON.parse(xhr.responseText);
            } catch (e) {
              // Ignore
            }
            onUploadSuccess(responseData);
          }
        } else {
          dispatch(
            updateTask({
              id,
              updates: { status: "ERROR", completionTime: Date.now() },
            })
          );
          taskRegistry.delete(id);
          if (onUploadError) {
            onUploadError(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        dispatch(
          updateTask({
            id,
            updates: { status: "ERROR", completionTime: Date.now() },
          })
        );
        taskRegistry.delete(id);
        if (onUploadError) {
          onUploadError(new Error("Network Error"));
        }
      };

      xhr.send(data);

      xhr.upload.onload = () => {
        const currentTask = tasks.find((t) => t.id === id);
        if (!currentTask || currentTask.status === "UPLOADING") {
          dispatch(
            updateTask({
              id,
              updates: {
                status: "PROCESSING",
                progress: 50,
                stepName: "PROCESSING_ON_SERVER",
                isUploadTask: true,
              },
            })
          );
        }
      };

      return id;
    },
    [token, dispatch, tasks]
  );

  const removeTask = useCallback(
    (id) => {
      taskRegistry.delete(id);
      dispatch(removeTaskAction(id));
    },
    [dispatch]
  );

  const revealTask = useCallback(
    (id) => {
      dispatch(revealTaskAction(id));
    },
    [dispatch]
  );

  const addCustomTask = useCallback(
    (task) => {
      dispatch(addTask({ ...task, isCustom: true }));
    },
    [dispatch]
  );

  const updateCustomTask = useCallback(
    (id, updates) => {
      dispatch(updateTask({ id, updates }));
    },
    [dispatch]
  );

  return {
    tasks,
    startTask: uploadFile, // General task runner alias
    uploadFile,            // Dedicated file upload helper
    removeTask,
    revealTask,
    addCustomTask,
    updateCustomTask,
  };
};

/**
 * Component hỗ trợ đồng bộ trạng thái lưu Cache & Cảnh báo reload trang khi có tác vụ đang chạy.
 */
export const GlobalTaskSync = () => {
  const tasks = useSelector(selectGlobalTasks);
  const token = useSelector(selectCurrentToken);
  const isConfirmingReload = useSelector(selectIsConfirmingReload);
  const dispatch = useDispatch();
  const { lang } = useLanguage();

  // Clear tasks when user logs out (no token)
  useEffect(() => {
    if (!token) {
      localStorage.removeItem("global_tasks_cache");
      dispatch(clearTasks());
    }
  }, [token, dispatch]);

  // Khôi phục tác vụ từ Cache khi Reload trang
  useEffect(() => {
    try {
      const cached = localStorage.getItem("global_tasks_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        const restored = parsed
          .filter((t) => {
            if (t.status === "PROCESSING") return now - t.timestamp < 3600000;
            if (t.status === "SUCCESS" || t.status === "ERROR") {
              return t.completionTime && now - t.completionTime < 180000;
            }
            return false;
          })
          .map((t) => ({ ...t, isRestored: true }));

        if (restored.length > 0) {
          dispatch(setTasks(restored));
        }
      }
    } catch (error) {
      console.error("Failed to restore tasks from cache", error);
    }
  }, [dispatch]);

  // Lưu trạng thái tác vụ vào localStorage
  useEffect(() => {
    const targetTasks = tasks
      .filter((t) => t.status === "PROCESSING" || t.status === "SUCCESS" || t.status === "ERROR")
      .map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        progress: t.progress,
        timestamp: t.timestamp || Date.now(),
        completionTime: t.completionTime,
        isCustom: t.isCustom,
        isRecording: t.isRecording,
      }));
    localStorage.setItem("global_tasks_cache", JSON.stringify(targetTasks));
  }, [tasks]);

  // Cảnh báo khi người dùng tắt / reload trình duyệt
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (window.__allowReload) return;

      const hasUploading = tasks.some((t) => t.status === "UPLOADING");
      if (hasUploading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [tasks]);

  // Bắt phím F5 / Ctrl+R để hiện Modal xác nhận
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isRefreshKey = e.key === "F5" || (e.ctrlKey && (e.key === "r" || e.key === "R"));
      if (isRefreshKey) {
        const hasUploading = tasks.some((t) => t.status === "UPLOADING");
        if (hasUploading) {
          e.preventDefault();
          dispatch(setConfirmingReload(true));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tasks, dispatch]);

  const handleConfirmReload = () => {
    window.__allowReload = true;
    window.location.reload();
  };

  return (
    <ConfirmationModal
      open={isConfirmingReload}
      onClose={() => dispatch(setConfirmingReload(false))}
      onConfirm={handleConfirmReload}
      title={lang?.cancelUploadConfirmTitle || "Đang xử lý tác vụ"}
      message={
        lang?.cancelUploadConfirmDesc ||
        "Đang có tiến trình tải dữ liệu lên chưa hoàn tất. Nếu bạn tải lại trang, dữ liệu sẽ bị mất. Bạn có chắc chắn muốn tiếp tục?"
      }
      confirmText={lang?.reload || "Tải lại trang"}
      cancelText={lang?.cancel || "Hủy"}
    />
  );
};
