import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentToken, selectCurrentUser } from "@/store/slices/authSlice";
import { reelsApi } from "@/store/api/reelsApi";
import {
  selectGlobalUploads,
  setUploads,
  addUpload,
  updateUpload,
  removeUpload as removeUploadAction,
  revealUpload as revealUploadAction,
  selectIsConfirmingReload,
  setConfirmingReload,
} from "@/store/slices/globalUploadSlice";
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal";
import { useLanguage } from "@/shared/context/LanguageContext";
import { useCancelTaskProgressMutation } from "@/store/api/taskProgressApi";

// Shared registry for XHR instances and custom cancel callbacks
const uploadRegistry = new Map();

export const useGlobalUpload = () => {
  const uploads = useSelector(selectGlobalUploads);
  const token = useSelector(selectCurrentToken);
  const dispatch = useDispatch();
  const [cancelTaskProgress] = useCancelTaskProgressMutation();

  const uploadFile = useCallback(
    ({ url, method = "POST", data, title, isHidden = false, onUploadSuccess, onUploadError }) => {
      const id = Math.random().toString(36).substring(7) + Date.now();

      const newUpload = {
        id,
        title,
        progress: 0,
        status: "UPLOADING", // 'UPLOADING', 'PROCESSING', 'SUCCESS', 'ERROR', 'CANCELED'
        timestamp: Date.now(),
        isHidden,
      };

      dispatch(addUpload(newUpload));

      const xhr = new XMLHttpRequest();
      uploadRegistry.set(id, { xhr });
      
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
          const rawProgress = (e.loaded / e.total) * 100;
          const scaledProgress = Math.round(rawProgress * 0.8);
          dispatch(updateUpload({ id, updates: { progress: scaledProgress } }));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          dispatch(updateUpload({ id, updates: { status: "SUCCESS", progress: 100, completionTime: Date.now() } }));
          uploadRegistry.delete(id);
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
          dispatch(updateUpload({ id, updates: { status: "ERROR", completionTime: Date.now() } }));
          uploadRegistry.delete(id);
          if (onUploadError) {
            onUploadError(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        dispatch(updateUpload({ id, updates: { status: "ERROR", completionTime: Date.now() } }));
        uploadRegistry.delete(id);
        if (onUploadError) {
          onUploadError(new Error("Network Error"));
        }
      };

      xhr.onabort = () => {
        dispatch(updateUpload({ id, updates: { status: "CANCELED" } }));
        uploadRegistry.delete(id);
      };

      xhr.send(data);

      xhr.upload.onload = () => {
        // Need to check current status since it might have been canceled
        const currentUpload = uploads.find((u) => u.id === id);
        if (!currentUpload || currentUpload.status === "UPLOADING") {
          dispatch(updateUpload({ id, updates: { status: "PROCESSING", progress: 80 } }));
        }
      };

      return id;
    },
    [token, dispatch, uploads]
  );

  const cancelUpload = useCallback((id) => {
    const registryItem = uploadRegistry.get(id);
    if (registryItem) {
      if (registryItem.onCancel) {
        registryItem.onCancel();
      } else if (registryItem.xhr) {
        registryItem.xhr.abort();
      }
      uploadRegistry.delete(id);
    }

    // Cancel task via RTK Query mutation
    cancelTaskProgress(id);

    dispatch(removeUploadAction(id));
  }, [dispatch, cancelTaskProgress]);

  const removeUpload = useCallback((id) => {
    uploadRegistry.delete(id);
    dispatch(removeUploadAction(id));
  }, [dispatch]);

  const revealUpload = useCallback((id) => {
    dispatch(revealUploadAction(id));
  }, [dispatch]);

  const addCustomTask = useCallback((task) => {
    dispatch(addUpload({ ...task, isCustom: true }));
    if (task.onCancel) {
      uploadRegistry.set(task.id, { onCancel: task.onCancel });
    }
  }, [dispatch]);

  const updateCustomTask = useCallback((id, updates) => {
    dispatch(updateUpload({ id, updates }));
  }, [dispatch]);

  return {
    uploads,
    uploadFile,
    cancelUpload,
    removeUpload,
    revealUpload,
    addCustomTask,
    updateCustomTask,
  };
};

export const GlobalUploadSync = () => {
  const uploads = useSelector(selectGlobalUploads);
  const user = useSelector(selectCurrentUser);
  const isConfirmingReload = useSelector(selectIsConfirmingReload);
  const dispatch = useDispatch();
  const { lang } = useLanguage();

  // Background polling for stuck uploads (e.g. after F5 reload)
  useEffect(() => {
    const processingUploads = uploads.filter(
      (u) => u.status === "PROCESSING" && u.isRestored
    );

    if (processingUploads.length === 0 || !user || (!user.userId && !user.id)) return;
    
    const actualUserId = user.userId || user.id;

    const interval = setInterval(async () => {
      try {
        const result = await dispatch(
          reelsApi.endpoints.getUserReels.initiate(
            { userId: actualUserId, page: 1, pageSize: 10 },
            { forceRefetch: true }
          )
        );

        if (result.data) {
          processingUploads.forEach((task) => {
            const isTimeout = Date.now() - task.timestamp > 180000;
            const foundReel = result.data.find(r => r.title === task.title);

            if (foundReel) {
              dispatch(
                updateUpload({
                  id: task.id,
                  updates: { status: "SUCCESS", progress: 100, completionTime: Date.now() },
                })
              );
            } else if (isTimeout) {
              dispatch(
                updateUpload({
                  id: task.id,
                  updates: { status: "ERROR", completionTime: Date.now() },
                })
              );
            }
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [uploads, user, dispatch]);

  // Restore on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem("global_uploads_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        const restored = parsed
          .filter((u) => {
            if (u.status === "PROCESSING") return now - u.timestamp < 3600000;
            if (u.status === "SUCCESS" || u.status === "ERROR") {
              return u.completionTime && now - u.completionTime < 180000;
            }
            return false;
          })
          .map((u) => ({
            ...u,
            isRestored: true,
          }));
        if (restored.length > 0) {
          dispatch(setUploads(restored));
        }
      }
    } catch (error) {
      console.error("Failed to restore uploads from cache", error);
    }
  }, [dispatch]);

  // Sync to localStorage
  useEffect(() => {
    const targetUploads = uploads
      .filter((u) => u.status === "PROCESSING" || u.status === "SUCCESS" || u.status === "ERROR")
      .map((u) => ({
        id: u.id,
        title: u.title,
        status: u.status,
        progress: u.progress,
        timestamp: u.timestamp || Date.now(),
        completionTime: u.completionTime,
        isCustom: u.isCustom,
        isRecording: u.isRecording,
      }));
    localStorage.setItem("global_uploads_cache", JSON.stringify(targetUploads));
  }, [uploads]);

  // beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // If we programmatically allowed reload via custom modal, skip the native one
      if (window.__allowReload) return;

      const hasUploading = uploads.some((u) => u.status === "UPLOADING");
      if (hasUploading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [uploads]);

  // Intercept F5 and Ctrl+R for custom modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isRefreshKey = e.key === "F5" || (e.ctrlKey && (e.key === "r" || e.key === "R"));
      if (isRefreshKey) {
        const hasUploading = uploads.some((u) => u.status === "UPLOADING");
        if (hasUploading) {
          e.preventDefault();
          dispatch(setConfirmingReload(true));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [uploads, dispatch]);

  const handleConfirmReload = () => {
    window.__allowReload = true;
    window.location.reload();
  };

  return (
    <>
      <ConfirmationModal
        open={isConfirmingReload}
        onClose={() => dispatch(setConfirmingReload(false))}
        onConfirm={handleConfirmReload}
        title={lang?.cancelUploadConfirmTitle || "Đang tải dữ liệu lên"}
        message={lang?.cancelUploadConfirmDesc || "Đang có tiến trình tải dữ liệu lên chưa hoàn tất. Nếu bạn tải lại trang, dữ liệu sẽ bị mất. Bạn có chắc chắn muốn tiếp tục?"}
        confirmText={lang?.reload || "Tải lại trang"}
        cancelText={lang?.cancel || "Hủy"}
      />
    </>
  );
};
