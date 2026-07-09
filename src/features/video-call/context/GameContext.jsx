import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useGameSignaling } from "../hooks/useGameSignaling";
import { useAuth } from "@/features/auth";
import { useParams } from "react-router-dom";
import {
  useLocalParticipant,
  useParticipants,
} from "@livekit/components-react";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/shared/context/LanguageContext";

const GameContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

export const GameProvider = ({ children, roomLanguage = "en" }) => {
  const { user } = useAuth();
  const { id: roomId } = useParams();
  const { t } = useLanguage();

  const localPart = useLocalParticipant();
  const localParticipantIdentity = localPart?.localParticipant?.identity;
  const localParticipantName = localPart?.localParticipant?.name;

  // Use user.id, user.accountId, user.userId or fallback to LiveKit identity
  const currentUserId = user?.id || user?.accountId || user?.userId || localParticipantIdentity;

  // Game states: idle | setup | playing | result | game_over
  const [gameState, setGameState] = useState("idle");
  const [gameType, setGameType] = useState(null); // 'crack_it' or 'picture_it'
  const [gameLanguage, setGameLanguage] = useState("en");

  const [countdown, setCountdown] = useState(null);
  const [currentRound, setCurrentRound] = useState(null);

  // Crack It specific states
  const [puzzle, setPuzzle] = useState(null);
  const [timer, setTimer] = useState(0);

  const [scores, setScores] = useState({});
  const [roundResults, setRoundResults] = useState(null);
  const [finalResults, setFinalResults] = useState(null);
  const [correctPlayers, setCorrectPlayers] = useState(new Set()); // IDs of players who answered correctly this round
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState(null);
  const [incorrectAttempts, setIncorrectAttempts] = useState([]); // List of wrong answers the user submitted this round
  const [playerNames, setPlayerNames] = useState({}); // Map of playerId -> playerName
  const [leftPlayers, setLeftPlayers] = useState(new Set()); // IDs of players who have left the game

  const connection = useGameSignaling({
    GAME_SETUP: (payload) => {
      setGameType(payload.game_type);
      setGameLanguage(payload.language);
      setGameState("setup");
      setScores({});
      setFinalResults(null);
      setLeftPlayers(new Set());
    },
    GAME_COUNTDOWN: (payload) => {
      setCountdown(payload.seconds);
    },
    ROUND_START: (payload) => {
      setGameState("playing");
      setCurrentRound({ 
        round: payload.round, 
        total: payload.total,
        started_at: payload.started_at 
      });
      setPuzzle({
        image_url: payload.image_url,
        hint: payload.hint,
        hint_pinyin: payload.hint_pinyin,
        word_count: payload.word_count,
        word_mask: payload.word_mask,
        correct_answer: payload.correct_answer,
      });
      setTimer(payload.timer);
      setCorrectPlayers(new Set());
      setLastCorrectAnswer(null);
      setIncorrectAttempts([]);
    },
    CORRECT_ANSWER: (payload) => {
      if (payload.is_correct) {
        const pid = payload.player_id.toString();
        setCorrectPlayers((prev) => new Set(prev).add(pid));
        setScores((prev) => ({
          ...prev,
          [pid]: (prev[pid] || 0) + payload.score_earned,
        }));
        // Track player name
        if (payload.player_name) {
          setPlayerNames((prev) => ({ ...prev, [pid]: payload.player_name }));
        }
        // Set the first correct answer to trigger flash notification (only once per round)
        setLastCorrectAnswer((prev) => {
          if (prev === null) {
            return { ...payload, _ts: Date.now() };
          }
          return prev;
        });
      } else {
        // custom event for wrong answer shake if it's the current user
        if (payload.player_id === currentUserId) {
          window.dispatchEvent(
            new CustomEvent("crackItWrongAnswer", { detail: payload.value }),
          );
          // track the incorrect attempt
          if (payload.value) {
            setIncorrectAttempts((prev) => [...prev, payload.value]);
          }
        }
      }
    },
    ROUND_RESULT: (payload) => {
      setGameState("result");
      setRoundResults(payload);
      if (payload.cumulative_scores) {
        setScores(payload.cumulative_scores);
      }
    },
    GAME_OVER: (payload) => {
      setGameState("game_over");
      setFinalResults(payload);
      setCountdown(null);
    },
    PLAYER_LEFT: (payload) => {
      if (payload.player_id) {
        setLeftPlayers((prev) =>
          new Set(prev).add(payload.player_id.toString()),
        );
      }
    },
    SYNC_GAME_STATE: (payload) => {
      setGameType(payload.game_type);
      setGameLanguage(payload.language);
      setScores(payload.scores || {});
      setLeftPlayers(
        new Set(payload.left_players?.map((id) => id.toString()) || []),
      );
      setCorrectPlayers(
        new Set(payload.correct_players?.map((id) => id.toString()) || []),
      );
      setCurrentRound({
        round: payload.current_round?.round,
        total: payload.current_round?.total,
        started_at: payload.current_round?.started_at,
      });
      setPuzzle({
        image_url: payload.current_round?.image_url,
        hint: payload.current_round?.hint,
        hint_pinyin: payload.current_round?.hint_pinyin,
        word_count: payload.current_round?.word_count,
        word_mask: payload.current_round?.word_mask,
        correct_answer: payload.current_round?.correct_answer,
      });
      setTimer(payload.current_round?.timer || 60);
      setGameState("playing");
    },
    GAME_FORCE_STOP: (payload) => {
      toast.error(
        payload.reason === "NOT_ENOUGH_PLAYERS"
          ? t.rooms?.game?.crackIt?.forceStopNotEnoughPlayers ||
              "Không đủ người chơi tiếp tục. Trò chơi đã bị hủy."
          : t.rooms?.game?.crackIt?.forceStopGeneric ||
              "Trò chơi bị dừng đột ngột.",
      );
      setGameState("idle");
      setGameType(null);
    },
  });

  useEffect(() => {
    const targetRoom = roomId || "general";
    if (connection.isConnected) {
      connection.send("JoinRoom", targetRoom);
      return () => {
        connection.send("LeaveRoom", targetRoom);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection.isConnected, roomId]);

  const participants = useParticipants();

  const startGame = useCallback(
    (type = "crack_it", level = "easy", language = null) => {
      // If we're not in a call, default to 1 player (solo mode testing) or get from participants list
      const playerCount = Math.max(1, participants?.length || 1);

      connection.send("StartCrackItGame", {
        game_type: type,
        level,
        language: language || roomLanguage,
        roomId: roomId || "general",
        player_count: playerCount,
      });
    },
    [connection.send, roomLanguage, roomId, participants?.length],
  );

  useEffect(() => {
    const handleHostStart = (e) => {
      if (gameState === "idle") {
        const detail = e.detail || {};
        startGame("crack_it", detail.level || "easy", detail.language);
      }
    };
    window.addEventListener("hostStartGame", handleHostStart);
    return () => window.removeEventListener("hostStartGame", handleHostStart);
  }, [startGame, gameState]);

  const submitAnswer = useCallback(
    (answer) => {
      const payload = {
        answer,
        player_id: currentUserId,
        player_name:
          localParticipantName ||
          user?.fullName ||
          user?.username ||
          "Anonymous",
        roomId: roomId || "general",
      };
      connection.send("SubmitCrackItAnswer", payload);
    },
    [connection.send, currentUserId, localParticipantName, user, roomId],
  );

  const exitGame = useCallback(() => {
    connection.send("PlayerLeaveGame", roomId || "general");
    setGameState("idle");
    setGameType(null);
  }, [connection, roomId]);

  const value = {
    gameState,
    gameType,
    gameLanguage,
    countdown,
    currentRound,
    puzzle,
    timer,
    scores,
    roundResults,
    finalResults,
    correctPlayers,
    lastCorrectAnswer,
    incorrectAttempts,
    startGame,
    submitAnswer,
    exitGame,
    currentUserId,
    playerNames,
    leftPlayers,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
