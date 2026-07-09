import { useState, useRef, useEffect, useCallback } from "react";
import { HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";
import { useAuth } from "@/features/auth";
import { store } from "@store";

export const useGameSignaling = (handlers = {}) => {
  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef(null);
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_BASE_URL || "/api";
    const baseUrl = apiUrl.replace(/\/api\/?$/, "");
    const hubUrl = `${baseUrl}/hubs/game`;

    const newConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => store.getState().auth.token })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = newConnection;

    const safeHandler = (name) => (...args) => {
      const handler = handlersRef.current[name];
      if (handler) handler(...args);
    };

    const events = [
      "GAME_SETUP", "GAME_COUNTDOWN", "ROUND_START",
      "CORRECT_ANSWER", "ROUND_RESULT", "GAME_OVER", "PLAYER_LEFT",
      "SYNC_GAME_STATE", "GAME_FORCE_STOP", "GAME_ALREADY_STARTED",
      "JOINED_AS_SPECTATOR", "ROUND_START_DESCRIBER", "DESCRIBE_STARTED",
      "DESCRIBE_ENDED", "FLAG_SUBMITTED", "ROUND_FLAGGED",
      "RATING_OPEN", "ROUND_SKIPPED", "PICTURE_IT_ERROR"
    ];

    events.forEach(evt => newConnection.on(evt, safeHandler(evt)));

    newConnection.start()
      .then(() => setIsConnected(true))
      .catch(err => console.error("[GameSignalR] Connection Error:", err));

    return () => {
      newConnection.stop().catch(() => { });
      setIsConnected(false);
    };
  }, [token]);

  const send = useCallback(async (methodName, ...args) => {
    if (connectionRef.current?.state === HubConnectionState.Connected) {
      try {
        await connectionRef.current.invoke(methodName, ...args);
      } catch (err) {
        console.error(`[GameSignalR] Send ${methodName} error:`, err);
      }
    } else {
      console.warn("[GameSignalR] Cannot send, not connected.");
    }
  }, []);

  return { isConnected, send };
};