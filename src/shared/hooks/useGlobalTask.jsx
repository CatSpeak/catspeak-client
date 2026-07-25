import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentToken } from "@/store/slices/authSlice";
import {
  selectGlobalTasks,
  addTask,
  updateTask,
  selectIsConfirmingReload,
  setConfirmingReload,
  clearTasks,
} from "@/store/slices/globalTaskSlice";
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal";
import { useLanguage } from "@/shared/context/LanguageContext";

/**
 * Custom Hook quản lý tác vụ toàn cục (Global Task Management System).
 * Cung cấp API React thuần túy, dễ đọc và linh hoạt để khởi tạo, theo dõi & cập nhật tác vụ lên Progress Bar.
 */
export const useGlobalTask = () => {
  const tasks = useSelector(selectGlobalTasks);
  const token = useSelector(selectCurrentToken);
  const dispatch = useDispatch();

  /**
   * Khởi chạy một tác vụ toàn cục (Hỗ trợ cả XHR Upload Byte thực tế & Hàm Async/RTK Query mutation).
   *
   * @param {Object} params
   * @param {string} [params.id] - Task ID tùy chỉnh (nếu không truyền sẽ tự tạo mới)
   * @param {string} params.title - Tiêu đề hiển thị trên Progress Bar
   * @param {string} [params.taskType] - Loại tác vụ (ReelUpload, InstructorApplication, Recording...)
   * @param {string} [params.url] - URL API (dành cho tác vụ upload file XHR thuần)
   * @param {string} [params.method] - HTTP method (mặc định POST)
   * @param {FormData|Object} [params.data] - Dữ liệu payload / FormData
   * @param {Function} [params.taskFn] - Hàm async thực thi công việc (nếu dùng RTK Query / Async function)
   * @param {boolean} [params.isHidden] - Ẩn khỏi widget UI
   * @param {boolean} [params.isUploadTask] - Cờ đánh dấu tác vụ upload file (để bật bảo vệ F5)
   * @param {Function} [params.onSuccess] - Callback khi hoàn tất thành công
   * @param {Function} [params.onError] - Callback khi gặp lỗi
   * @returns {string} taskId
   */
  const startTask = useCallback(
    async ({
      id: customId,
      title = "Tác vụ hệ thống",
      taskType = "GENERAL",
      url = null,
      method = "POST",
      data = null,
      taskFn = null,
      isHidden = false,
      isUploadTask = false,
      onSuccess = null,
      onError = null,
    }) => {
      const taskId =
        customId || Math.random().toString(36).substring(7) + Date.now();
      const successCb = onSuccess;
      const errorCb = onError;

      // Đính kèm TaskId vào FormData để đồng bộ với SignalR backend (nếu có)
      if (data instanceof FormData && !data.has("TaskId")) {
        data.append("TaskId", taskId);
      }

      const isUpload = Boolean(isUploadTask);

      dispatch(
        addTask({
          id: taskId,
          title,
          taskType,
          status: isUpload ? "UPLOADING" : "PROCESSING",
          progress: 0,
          timestamp: Date.now(),
          isHidden,
          isUploadTask: isUpload,
        }),
      );

      // ----------------------------------------------------------------------
      // Trường hợp 1: Tác vụ Upload file XHR thuần (chỉ chạy khi truyền url và KHÔNG truyền taskFn)
      // ----------------------------------------------------------------------
      if (isUpload && typeof taskFn !== "function" && url) {
        const xhr = new XMLHttpRequest();

        const targetUrl = url || "";
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
        const finalUrl = targetUrl.startsWith("http")
          ? targetUrl
          : `${baseUrl}${targetUrl}`;

        xhr.open(method, finalUrl, true);

        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        const match = window.location.pathname.match(/^\/([a-z]{2})(?:\/|$)/i);
        if (match) {
          xhr.setRequestHeader("X-Community-Lang", match[1]);
        }

        // 1. Tính % tiến độ upload Byte thực tế theo thời gian thực (0% -> 99%)
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && e.total > 0) {
            const percent = Math.min(
              99,
              Math.floor((e.loaded / e.total) * 100),
            );
            dispatch(
              updateTask({
                id: taskId,
                updates: {
                  status: "UPLOADING",
                  progress: percent,
                },
              }),
            );
          }
        };

        // 2. Gửi xong 100% Byte file sang server -> Chuyển trạng thái sang PROCESSING
        xhr.upload.onload = () => {
          dispatch(
            updateTask({
              id: taskId,
              updates: {
                status: "PROCESSING",
              },
            }),
          );
        };

        // 3. Xử lý phản hồi từ Server khi HTTP Request hoàn tất
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            let resData = null;
            try {
              resData = JSON.parse(xhr.responseText);
            } catch {}

            dispatch(
              updateTask({
                id: taskId,
                updates: {
                  status: "SUCCESS",
                  progress: 100,
                  completionTime: Date.now(),
                  payload: resData,
                },
              }),
            );
            if (successCb) successCb(resData);
          } else {
            let errorMsg = "Tải lên thất bại";
            try {
              const res = JSON.parse(xhr.responseText);
              errorMsg = res.message || errorMsg;
            } catch {}

            dispatch(
              updateTask({
                id: taskId,
                updates: {
                  status: "ERROR",
                  completionTime: Date.now(),
                  error: errorMsg,
                },
              }),
            );
            if (errorCb) errorCb(new Error(errorMsg));
          }
        };

        // 4. Xử lý khi gặp lỗi mạng kết nối
        xhr.onerror = () => {
          const errorMsg = "Lỗi kết nối mạng";
          dispatch(
            updateTask({
              id: taskId,
              updates: {
                status: "ERROR",
                completionTime: Date.now(),
                error: errorMsg,
              },
            }),
          );
          if (errorCb) errorCb(new Error(errorMsg));
        };

        xhr.send(data);
        return taskId;
      }

      // ----------------------------------------------------------------------
      // Trường hợp 2: Chạy hàm Async / RTK Query mutation từ src/store/api
      // ----------------------------------------------------------------------
      if (typeof taskFn === "function") {
        try {
          const reportProgress = (percentage, stepName) => {
            dispatch(
              updateTask({
                id: taskId,
                updates: {
                  progress: Math.min(99, Math.max(0, percentage)),
                  ...(stepName ? { stepName } : {}),
                },
              }),
            );
          };

          const result = await taskFn(taskId, reportProgress);

          dispatch(
            updateTask({
              id: taskId,
              updates: {
                status: "SUCCESS",
                progress: 100,
                completionTime: Date.now(),
                payload: result,
              },
            }),
          );
          if (successCb) successCb(result);
          return result;
        } catch (err) {
          const errorMsg =
            err?.data?.message || err?.message || "Tác vụ thất bại";
          dispatch(
            updateTask({
              id: taskId,
              updates: {
                status: "ERROR",
                completionTime: Date.now(),
                error: errorMsg,
              },
            }),
          );
          if (errorCb) errorCb(err);
          throw err;
        }
      }

      return taskId;
    },
    [token, dispatch],
  );

  /**
   * Cập nhật tiến độ của một tác vụ đang chạy (% progress và tên bước)
   */
  const updateTaskProgress = useCallback(
    (id, progress, stepName = null) => {
      dispatch(
        updateTask({
          id,
          updates: {
            progress: Math.min(100, Math.max(0, progress)),
            ...(stepName ? { stepName } : {}),
          },
        }),
      );
    },
    [dispatch],
  );

  /**
   * Đánh dấu tác vụ thành công
   */
  const completeTask = useCallback(
    (id, payload = null) => {
      dispatch(
        updateTask({
          id,
          updates: {
            status: "SUCCESS",
            progress: 100,
            completionTime: Date.now(),
            ...(payload ? { payload } : {}),
          },
        }),
      );
    },
    [dispatch],
  );

  /**
   * Đánh dấu tác vụ thất bại
   */
  const failTask = useCallback(
    (id, errorMessage = "Tác vụ thất bại") => {
      dispatch(
        updateTask({
          id,
          updates: {
            status: "ERROR",
            completionTime: Date.now(),
            error: errorMessage,
          },
        }),
      );
    },
    [dispatch],
  );

  return {
    tasks,
    startTask, // Hàm đẩy BẤT KỲ tác vụ nào vào Progress Bar
    completeTask, // Đánh dấu hoàn tất
    failTask, // Đánh dấu thất bại
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

  // Xóa tasks khi logout
  useEffect(() => {
    if (!token) {
      dispatch(clearTasks());
    }
  }, [token, dispatch]);

  // Cảnh báo reload/tắt tab & bắt phím F5 / Ctrl+R CHỈ KHI đang UPLOADING FILE (isUploadTask)
  useEffect(() => {
    const isFileUploading = (t) =>
      Boolean(t.isUploadTask) && t.status === "UPLOADING";

    const handleBeforeUnload = (e) => {
      if (window.__allowReload || isConfirmingReload) return;
      if (tasks.some(isFileUploading)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handleKeyDown = (e) => {
      const isRefreshKey =
        e.key === "F5" ||
        e.code === "F5" ||
        e.keyCode === 116 ||
        (e.ctrlKey && (e.key === "r" || e.key === "R" || e.code === "KeyR"));

      if (isRefreshKey && tasks.some(isFileUploading)) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") {
          e.stopImmediatePropagation();
        }
        dispatch(setConfirmingReload(true));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [tasks, isConfirmingReload, dispatch]);

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
