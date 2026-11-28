import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";

import { handleMediaError } from "@/shared/utils/mediaErrorUtils";
import { useMaskTextMutation } from "@/store/api/moderationApi";
import { getCommunityPath } from "@/shared/utils/navigation";
import { copyRoomLink } from "@/shared/utils/shareUtils";
import {
  setPiP as setPiPAction,
  setPipFallbackMode,
  leaveCall as leaveCallAction,
} from "@/store/slices/videoCallSlice";
import { getNavigate } from "./useNavigateRef";

/**
 * All user-facing action handlers for a video call.
 *
 * Groups: media toggles, chat, session leave, link copy, PiP transitions.
 * Each handler wraps the raw LiveKit action with error handling / toasts.
 *
 * @param {object} params
 * @param {object} params.t               - Translation object
 * @param {string} params.language        - Current language code
 * @param {boolean} params.isPiP          - Whether currently in PiP mode
 * @param {object} params.callInfo        - Call info from Redux (callPath etc.)
 * @param {Function} params.toggleAudioFn - LiveKit mic toggle
 * @param {Function} params.toggleVideoFn - LiveKit camera toggle
 * @param {Function} params.leaveMeetingFn - LiveKit room.disconnect()
 * @param {object} params.screenShareState - Screen share state from useScreenShare()
 * @param {Function} params.chatSend      - LiveKit chat send function
 * @param {Function} params.chatSend      - LiveKit chat send function
 * @param {Function} params.setActiveSidePanel - UI state setter
 */
export const useCallActions = ({
  t,
  language,
  isPiP,
  callInfo,
  toggleAudioFn,
  toggleVideoFn,
  leaveMeetingFn,
  screenShareState,
  chatSend,
  setActiveSidePanel,
}) => {
  const dispatch = useDispatch();

  // [Moderation] Chat phòng meet đi thẳng client → LiveKit → client, không qua
  // backend .NET, nên đây là chỗ DUY NHẤT chặn được từ vi phạm trong phòng.
  const [maskText] = useMaskTextMutation();

  // ── Media toggles ──

  const handleToggleMic = useCallback(async () => {
    try {
      await toggleAudioFn();
    } catch (err) {
      console.error("[useCallActions] Mic toggle failed with error:", {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
        raw: err,
      });
      handleMediaError(err, "mic", t, { isToggle: true });
    }
  }, [toggleAudioFn, t]);

  const handleToggleCam = useCallback(async () => {
    try {
      await toggleVideoFn();
    } catch (err) {
      console.error("[useCallActions] Camera toggle failed with error:", {
        name: err?.name,
        message: err?.message,
        stack: err?.stack,
        raw: err,
      });
      handleMediaError(err, "camera", t, { isToggle: true });
    }
  }, [toggleVideoFn, t]);

  const handleToggleScreenShare = useCallback(() => {
    try {
      screenShareState.toggleScreenShare();
    } catch (err) {
      console.error("[useCallActions] Screen share error:", err);
      toast.error(
        t?.rooms?.videoCall?.screenShare?.error ?? "Failed to share screen.",
      );
    }
  }, [screenShareState, t]);

  // ── Chat ──

  const handleSendMessage = useCallback(
    async (text, replyTarget) => {
      try {
        // [Moderation] Che ★ từ vi phạm TRƯỚC khi đẩy vào LiveKit, để mọi người
        // trong phòng đều nhận bản sạch. Áp dụng cho cả tin thường lẫn tin trả lời.
        //
        // Fail-open có chủ ý: API kiểm duyệt lỗi, chậm, hay người dùng chưa đăng
        // nhập thì gửi nguyên văn. Một cuộc gọi đang diễn ra không được phép đứng
        // im chỉ vì dịch vụ phụ trợ hỏng.
        let safeText = text;
        try {
          const res = await maskText({ text }).unwrap();
          // Backend bọc phản hồi trong ApiResponse ({ data: {...} }); đọc cả hai
          // dạng để không phụ thuộc vào lớp bọc đó.
          safeText = res?.data?.masked ?? res?.masked ?? text;
        } catch {
          // Đã fail-open — không toast, không log ồn: người dùng không làm gì sai.
        }

        if (replyTarget) {
          await chatSend(
            JSON.stringify({
              isReply: true,
              text: safeText,
              replyTo: {
                message: replyTarget.message,
                name: replyTarget.from?.name || "User",
              },
            }),
          );
        } else {
          await chatSend(safeText);
        }
      } catch (err) {
        console.error("[useCallActions] Failed to send chat message:", err);
      }
    },
    [chatSend, maskText],
  );

  // ── Leave session ──

  const handleLeaveSession = useCallback(async () => {
    // Thông báo cho game (nếu đang chơi) để gọi exitGame → gửi PlayerLeaveGame lên BE.
    // GameProvider sẽ lắng nghe event này và tự xử lý (player thì gọi BE, spectator thì chỉ reset FE).
    // Dùng CustomEvent trên window để tránh phải truyền signalR connection xuống đây.
    try {
      window.dispatchEvent(new CustomEvent("hostLeaveGame"))
    } catch {
      // ignore
    }

    await leaveMeetingFn()
    dispatch(leaveCallAction())

    // If leaving while in PiP mode (not on the call page), navigate away
    const navigate = getNavigate();
    if (isPiP && navigate) {
      if (callInfo?.isLearningPath) {
        navigate(`/${language || "vi"}/learning-path`, { replace: true });
      } else {
        navigate(getCommunityPath(language), { replace: true });
      }
    }
    // On call page, stay on URL so VideoCallProvider re-opens WaitingScreen (allows rejoin or exit)
  }, [isPiP, language, leaveMeetingFn, dispatch, callInfo?.isLearningPath]);

  // ── Copy link ──

  const handleCopyLink = useCallback(() => {
    const url = callInfo?.callPath
      ? `${window.location.origin}${callInfo.callPath}`
      : window.location.href;
    copyRoomLink({ baseUrl: url, room: callInfo?.roomData });
  }, [callInfo]);

  // ── PiP transitions ──

  const checkIsPiPSupported = useCallback(() => {
    if (typeof window === "undefined") return false
    if ("documentPictureInPicture" in window) return true
    if ("pictureInPictureEnabled" in document && document.pictureInPictureEnabled)
      return true

    const videos = Array.from(document.querySelectorAll("video"))
    for (const v of videos) {
      if (
        v.webkitSupportsPresentationMode &&
        typeof v.webkitSetPresentationMode === "function" &&
        v.webkitSupportsPresentationMode("picture-in-picture")
      ) {
        return true
      }
    }
    if (
      typeof HTMLVideoElement !== "undefined" &&
      "webkitSetPresentationMode" in HTMLVideoElement.prototype
    ) {
      return true
    }
    return false
  }, [])

  const enterPiP = useCallback(
    async (navigateTo) => {
      const navigate = getNavigate();
      const explicitTarget =
        typeof navigateTo === "string" && navigateTo ? navigateTo : null;

      // In-app fallback: never silently no-op, never leave isPiP=true invisible.
      const enterInAppFallback = (reason) => {
        console.warn("[PiP] Falling back to in-app floating widget:", reason);
        if (navigate) {
          dispatch(setPipFallbackMode(true));
          dispatch(setPiPAction(true));
          setActiveSidePanel(null);
          navigate(explicitTarget || getCommunityPath(language));
          toast.success(
            t?.rooms?.videoCall?.pipFallback ||
              "Picture-in-Picture is blocked by your browser — showing the in-app mini player instead.",
            { icon: "🪟", duration: 5000 },
          );
          return;
        }
        // No navigation available → do not leave an invisible PiP state behind.
        dispatch(setPipFallbackMode(false));
        dispatch(setPiPAction(false));
        toast.error(
          t?.rooms?.videoCall?.pipNotAvailable ||
            "Picture-in-Picture is not available in this environment.",
        );
      };

      // 1. Document Picture-in-Picture (Desktop Chrome / Edge / Chrome Android)
      if (typeof window !== "undefined" && "documentPictureInPicture" in window) {
        try {
          // requestWindow() must run inside the click gesture — call it first.
          const pipWin = await window.documentPictureInPicture.requestWindow({
            width: 400,
            height: 300,
          });
          if (!pipWin || pipWin.closed) {
            enterInAppFallback("requestWindow returned no usable window");
            return;
          }
          window.__pipWindow = pipWin;
          window.__activePipWindow = pipWin;
          dispatch(setPipFallbackMode(false));
          dispatch(setPiPAction(true));
          setActiveSidePanel(null);
          if (explicitTarget && navigate) navigate(explicitTarget);
          toast.success(
            t?.rooms?.videoCall?.pipActivated ||
              "Picture-in-Picture activated",
            { icon: "🪟", duration: 4000 },
          );
          return;
        } catch (err) {
          enterInAppFallback(err);
          return;
        }
      }

      // 2. Native Video Picture-in-Picture Fallback (iOS Safari / Standard Video PiP)
      const videos = Array.from(document.querySelectorAll("video"));
      const targetVideo =
        videos.find((v) => !v.paused && v.readyState >= 2) || videos[0];

      if (targetVideo) {
        // iOS Safari WebKit Presentation Mode
        if (
          targetVideo.webkitSupportsPresentationMode &&
          typeof targetVideo.webkitSetPresentationMode === "function"
        ) {
          try {
            targetVideo.webkitSetPresentationMode("picture-in-picture");
            toast.success(
              t?.rooms?.videoCall?.pipActivated ||
                "Picture-in-Picture activated",
            );
            return;
          } catch (err) {
            console.error("Failed iOS Safari webkitSetPresentationMode:", err);
          }
        }

        // Standard W3C HTML5 Video requestPictureInPicture
        if (
          document.pictureInPictureEnabled &&
          typeof targetVideo.requestPictureInPicture === "function"
        ) {
          try {
            await targetVideo.requestPictureInPicture();
            toast.success(
              t?.rooms?.videoCall?.pipActivated ||
                "Picture-in-Picture activated",
            );
            return;
          } catch (err) {
            console.error("Failed requestPictureInPicture:", err);
          }
        }
      }

      // 3. Nothing native worked → in-app floating widget + navigate away
      enterInAppFallback("no native PiP support");
    },
    [dispatch, setActiveSidePanel, t, language],
  );

  const exitPiP = useCallback(() => {
    dispatch(setPipFallbackMode(false));
    dispatch(setPiPAction(false));
  }, [dispatch]);

  const returnToCall = useCallback(() => {
    const navigate = getNavigate();
    if (callInfo?.callPath && navigate) {
      dispatch(setPipFallbackMode(false));
      dispatch(setPiPAction(false));
      navigate(callInfo.callPath);
    }
  }, [dispatch, callInfo]);

  return {
    handleToggleMic,
    handleToggleCam,
    handleToggleScreenShare,
    handleSendMessage,
    handleLeaveSession,
    handleCopyLink,
    enterPiP,
    exitPiP,
    returnToCall,
    isPiPSupported: checkIsPiPSupported(),
  };
};
