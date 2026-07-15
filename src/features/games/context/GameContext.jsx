import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
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

const initialPictureItState = {
  describerId: null,
  describerOrder: [],
  imageUrl: null,
  imageUrlFull: null,
  imageBlurred: true,
  category: null,
  forbiddenWords: [],
  tags: [],
  describeStarted: false,
  ratingOpen: false,
  ratingCountdownSec: 0,
  myRatingSubmitted: false,
  flagCount: 0,
  raterCount: 0,
  isSpectator: false,
  badges: {},
  winnerIds: [],
  leaderboard: [],
};

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

  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();

  const localParticipantIdentity = localParticipant?.identity;
  const localParticipantName = localParticipant?.name;

  // Use user.id, user.accountId, user.userId or fallback to LiveKit identity
  const currentUserId =
    user?.id || user?.accountId || user?.userId || localParticipantIdentity;

  // Game states: idle | setup | playing | result | game_over | force_stopped
  const [gameState, setGameState] = useState("idle");
  const [gameType, setGameType] = useState(null); // 'crack_it' or 'picture_it'
  const [gameLanguage, setGameLanguage] = useState("en");

  const [countdown, setCountdown] = useState(null);
  const [currentRound, setCurrentRound] = useState(null);

  // Common states
  const [scores, setScores] = useState({});
  const [roundResults, setRoundResults] = useState(null);
  const [finalResults, setFinalResults] = useState(null);
  const [playerNames, setPlayerNames] = useState({}); // Map of playerId -> playerName
  const [leftPlayers, setLeftPlayers] = useState(new Set()); // IDs of players who have left the game

  // --- Spectator & Ongoing Mode ---
  const [ongoingGame, setOngoingGame] = useState(false);
  const [ongoingGameType, setOngoingGameType] = useState(null);
  const [isSpectator, setIsSpectator] = useState(false);
  const [gamePlayers, setGamePlayers] = useState(new Set());
  const [spectatorIds, setSpectatorIds] = useState(new Set());

  // --- Crack It specific states ---
  const [puzzle, setPuzzle] = useState(null);
  const [timer, setTimer] = useState(0);
  const [correctPlayers, setCorrectPlayers] = useState(new Set()); // IDs of players who answered correctly this round
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState(null);
  const [incorrectAttempts, setIncorrectAttempts] = useState([]); // List of wrong answers the user submitted this round

  // --- Picture It specific states ---
  const [pictureItState, setPictureItState] = useState(initialPictureItState);

  // Timer ref for Picture It Rating
  const ratingTimerRef = useRef(null);
  const gameOverTimeoutRef = useRef(null);
  const hasInitialSyncRef = useRef(false);

  const resetGameStates = useCallback(() => {
    setScores({});
    setRoundResults(null);
    setFinalResults(null);
    setCountdown(null);
    setCurrentRound(null);
    setOngoingGame(false);
    setOngoingGameType(null);
    setIsSpectator(false);
    setGamePlayers(new Set());
    setSpectatorIds(new Set());
    setLeftPlayers(new Set());
    setPuzzle(null);
    setTimer(0);
    setCorrectPlayers(new Set());
    setLastCorrectAnswer(null);
    setIncorrectAttempts([]);
    setPictureItState(initialPictureItState);
    if (gameOverTimeoutRef.current) {
      clearTimeout(gameOverTimeoutRef.current);
      gameOverTimeoutRef.current = null;
    }
    if (ratingTimerRef.current) {
      clearInterval(ratingTimerRef.current);
      ratingTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (gameOverTimeoutRef.current) clearTimeout(gameOverTimeoutRef.current);
      if (ratingTimerRef.current) clearInterval(ratingTimerRef.current);
    };
  }, []);

  const startRatingTimer = useCallback((seconds) => {
    if (ratingTimerRef.current) clearInterval(ratingTimerRef.current);
    let remaining = seconds;
    setPictureItState((prev) => ({ ...prev, ratingCountdownSec: remaining }));
    ratingTimerRef.current = setInterval(() => {
      remaining -= 1;
      setPictureItState((prev) => ({ ...prev, ratingCountdownSec: remaining }));
      if (remaining <= 0) {
        clearInterval(ratingTimerRef.current);
        setPictureItState((prev) => ({ ...prev, ratingOpen: false }));
      }
    }, 1000);
  }, []);

  const connection = useGameSignaling({
    GAME_SETUP: (payload) => {
      setGameType(payload.game_type);
      setGameLanguage(payload.language);
      setGameState("setup");
      resetGameStates();
      setGamePlayers(
        new Set(payload.original_players?.map((id) => id.toString()) || []),
      );
      if (payload.game_type === "picture_it") {
        setPictureItState((prev) => ({
          ...prev,
          describerOrder: payload.describer_order || [],
        }));
      }
    },
    GAME_COUNTDOWN: (payload) => {
      setCountdown(payload.seconds);
      if (payload.seconds === 0 && gameState === "setup") {
        setGameState("playing");
      }
    },
    ROUND_START: (payload) => {
      setGameState("playing");
      setCurrentRound({
        round: payload.round,
        total: payload.total,
        started_at: payload.started_at,
      });

      if (gameType === "picture_it") {
        setPictureItState((prev) => ({
          ...prev,
          describerId: payload.describer_id,
          imageUrl: payload.image_url_blur,
          imageUrlFull: null,
          imageBlurred: true,
          category: payload.category,
          tags: payload.tags || [],
          forbiddenWords: payload.forbidden_words || [],
          describeStarted: false,
          ratingOpen: false,
          myRatingSubmitted: false,
          flagCount: 0,
          raterCount: 0,
          roundAverageRating: null,
          roundDescriberId: null,
        }));
      } else {
        setPuzzle({
          image_url: payload.image_url,
          hint_en: payload.hint_en,
          hint_zh: payload.hint_zh,
          hint_pinyin: payload.hint_pinyin,
          word_count: payload.word_count,
          word_mask: payload.word_mask,
          correct_answer: payload.correct_answer,
        });
        setTimer(payload.timer);
        setCorrectPlayers(new Set());
        setLastCorrectAnswer(null);
        setIncorrectAttempts([]);
      }
    },
    // Picture IT only
    ROUND_START_DESCRIBER: (payload) => {
      setGameState("playing");
      setCurrentRound({
        round: payload.round,
        total: payload.total,
      });
      setPictureItState((prev) => ({
        ...prev,
        describerId: payload.describer_id,
        imageUrl: payload.image_url_full,
        imageUrlFull: payload.image_url_full,
        imageBlurred: false,
        category: payload.category,
        tags: payload.tags || [],
        forbiddenWords: payload.forbidden_words || [],
        describeStarted: false,
        ratingOpen: false,
        myRatingSubmitted: false,
        flagCount: 0,
        raterCount: 0,
      }));
    },
    DESCRIBE_STARTED: (payload) => {
      setPictureItState((prev) => ({
        ...prev,
        describeStarted: true,
        describeStartTime: payload?.describe_start_time
      }));
    },
    DESCRIBE_ENDED: (payload) => {
      setPictureItState((prev) => ({
        ...prev,
        imageUrlFull: payload.image_url_full,
        imageBlurred: false,
        imageUrl: payload.image_url_full,
        describeStarted: false,
      }));
    },
    FLAG_SUBMITTED: (payload) => {
      setPictureItState((prev) => ({
        ...prev,
        flagCount: payload.flag_count,
        raterCount: payload.rater_count,
      }));
    },
    ROUND_FLAGGED: () => {
      setPictureItState((prev) => ({ ...prev, ratingOpen: false }));
    },
    ROUND_SKIPPED: (payload) => {
      toast.error(payload.reason || "Round skipped.");
      setPictureItState((prev) => ({ ...prev, ratingOpen: false }));
    },
    RATING_OPEN: (payload) => {
      const seconds = payload.countdown_seconds || 15;
      setPictureItState((prev) => ({
        ...prev,
        ratingOpen: true,
        ratingCountdownSec: seconds,
      }));
      startRatingTimer(seconds);
    },
    PICTURE_IT_ERROR: (payload) => {
      toast.error(payload.message || "An error occurred.");
      setGameState("idle");
      resetGameStates();
    },
    JOINED_AS_SPECTATOR: () => {
      setIsSpectator(true);
      setPictureItState((prev) => ({ ...prev, isSpectator: true }));
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
        if (payload.player_id === currentUserId) {
          window.dispatchEvent(
            new CustomEvent("crackItCorrectAnswer", {
              detail: payload.score_earned,
            }),
          );
        }
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

        // For Picture IT, build leaderboard
        if (gameType === "picture_it") {
          const sortedLeaderboard = Object.entries(payload.cumulative_scores)
            .map(([id, score]) => {
              const pId = Number(id);
              const p = participants.find(
                (part) => Number(part.identity) === pId,
              );
              let username = p?.name || p?.identity || `Player ${pId}`;
              let avatarUrl = null;
              if (p?.metadata) {
                try {
                  const meta = JSON.parse(p.metadata);
                  avatarUrl = meta.avatarUrl;
                  if (meta.username) username = meta.username;
                  // eslint-disable-next-line no-unused-vars
                } catch (e) { /* empty */ }
              }
              return {
                id: pId,
                accountId: pId,
                name: username,
                username: username,
                avatar: avatarUrl,
                avatarUrl: avatarUrl,
                totalScore: score,
                score: score,
              };
            })
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
          setPictureItState((prev) => ({
            ...prev,
            leaderboard: sortedLeaderboard,
            roundAverageRating: payload.average_rating,
            roundDescriberId: payload.describer_id,
          }));
        }
      }
    },
    GAME_OVER: (payload) => {
      setGameState("game_over");
      setFinalResults(payload);
      setCountdown(null);
      if (payload.final_scores) {
        setScores(payload.final_scores);
        if (gameType === "picture_it") {
          const sortedLeaderboard = Object.entries(payload.final_scores)
            .map(([id, score]) => {
              const pId = Number(id);
              const p = participants.find(
                (part) => Number(part.identity) === pId,
              );
              let username = p?.name || p?.identity || `Player ${pId}`;
              let avatarUrl = null;
              if (p?.metadata) {
                try {
                  const meta = JSON.parse(p.metadata);
                  avatarUrl = meta.avatarUrl;
                  if (meta.username) username = meta.username;
                  // eslint-disable-next-line no-empty, no-unused-vars
                } catch (e) { }
              }
              return {
                id: pId,
                accountId: pId,
                name: username,
                username: username,
                avatar: avatarUrl,
                avatarUrl: avatarUrl,
                totalScore: score,
                score: score,
              };
            })
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
          setPictureItState((prev) => ({
            ...prev,
            leaderboard: sortedLeaderboard,
            winnerIds: payload.winner_ids || [],
            badges: payload.badges || {},
          }));
        }
      }

      if (gameOverTimeoutRef.current) clearTimeout(gameOverTimeoutRef.current);
      gameOverTimeoutRef.current = setTimeout(() => {
        setGameState("idle");
        resetGameStates();
      }, 10000);
    },
    PLAYER_LEFT: (payload) => {
      if (payload.player_id) {
        setLeftPlayers((prev) =>
          new Set(prev).add(payload.player_id.toString()),
        );
      }
    },
    PLAYER_SPECTATING: (payload) => {
      if (payload.player_id) {
        setSpectatorIds((prev) =>
          new Set(prev).add(payload.player_id.toString()),
        );
      }
    },
    SPECTATOR_LEFT: (payload) => {
      if (payload.player_id) {
        setSpectatorIds((prev) => {
          const next = new Set(prev);
          next.delete(payload.player_id.toString());
          return next;
        });
      }
    },
    SYNC_GAME_STATE: (payload) => {
      // If we just loaded the component (e.g., after F5 or re-entering the room)
      // and the backend still thinks we are a spectator (ghost connection),
      // we immediately leave the game to clear ourselves from the spectator list.
      let isActuallySpectating = payload.is_spectator || false;

      if (!hasInitialSyncRef.current) {
        hasInitialSyncRef.current = true;

        if (isActuallySpectating && connection && roomId) {
          // Note: The backend keeps the old connection alive for ~30s due to SignalR reconnect window.
          // We cannot force kill it from the frontend if PlayerLeaveGame doesn't work for spectators.
          // Just return early so the local UI doesn't force them into the game.
          setOngoingGame(true);
          setOngoingGameType(payload.game_type);
          return;
        }
      }

      setGameType(payload.game_type);
      setGameLanguage(payload.language);
      setScores(payload.scores || {});
      setIsSpectator(isActuallySpectating);
      setGamePlayers(
        new Set(payload.original_players?.map((id) => id.toString()) || []),
      );

      // If we receive SYNC_GAME_STATE, a game is running!
      setOngoingGame(true);
      setOngoingGameType(payload.game_type);

      setLeftPlayers(
        new Set(payload.left_players?.map((id) => id.toString()) || []),
      );
      setSpectatorIds(
        new Set(payload.spectators?.map((id) => id.toString()) || []),
      );

      if (payload.game_type === "picture_it") {
        setCurrentRound({
          round: payload.current_round?.round,
          total: payload.current_round?.total,
        });
        const describerId = payload.current_round?.describer_id;
        const isDescriber = Number(describerId) === Number(currentUserId);
        const isRatingOpen = payload.rating_open || false;

        setPictureItState((prev) => ({
          ...prev,
          describerId: describerId,
          describerOrder: payload.describer_order || [],
          imageUrl: payload.current_round?.image_url,
          imageUrlFull: (isDescriber || isRatingOpen) ? payload.current_round?.image_url : null,
          imageBlurred: !(isDescriber || isRatingOpen),
          forbiddenWords: payload.current_round?.forbidden_words || [],
          category: payload.current_round?.category,
          describeStarted: isRatingOpen ? false : (payload.current_round?.describe_started || false),
          describeStartTime: payload.current_round?.describe_start_time,
          ratingOpen: isRatingOpen,
          ratingCountdownSec: payload.current_round?.rating_countdown_sec || 0,
          myRatingSubmitted: payload.current_round?.my_rating_submitted || false,
          flagCount: payload.current_round?.flag_count || 0,
          raterCount: payload.current_round?.rater_count || 0,
          roundAverageRating: null,
          roundDescriberId: null,
        }));

        if (payload.rating_open && payload.current_round?.rating_countdown_sec > 0) {
          startRatingTimer(payload.current_round.rating_countdown_sec);
        }

        const sortedLeaderboard = Object.entries(payload.scores || {})
          .map(([id, score]) => ({ id: Number(id), score }))
          .sort((a, b) => b.score - a.score)
          .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
        setPictureItState((prev) => ({
          ...prev,
          leaderboard: sortedLeaderboard,
        }));
      } else {
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
          hint_en: payload.current_round?.hint_en,
          hint_zh: payload.current_round?.hint_zh,
          hint_pinyin: payload.current_round?.hint_pinyin,
          word_count: payload.current_round?.word_count,
          word_mask: payload.current_round?.word_mask,
          correct_answer: payload.current_round?.correct_answer,
        });
        setTimer(payload.current_round?.timer || 60);
      }
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
      resetGameStates();
    },
    GAME_ALREADY_STARTED: (payload) => {
      // Clean up ghost spectator state on backend if we just reconnected
      if (connection && roomId) {
        connection.send("PlayerLeaveGame", roomId);
      }
      setOngoingGame(true);
      setOngoingGameType(payload.game_type);
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

  useEffect(() => {
    const isPictureIt = gameType === "picture_it" || gameType === "picture-it";
    if (
      isPictureIt &&
      !["idle", "game_over", "force_stopped"].includes(gameState)
    ) {
      if (gameState === "setup" || gameState === "result") {
        localParticipant?.setMicrophoneEnabled(false).catch(() => { });
      } else if (gameState === "playing") {
        if (pictureItState.describeStarted && !pictureItState.ratingOpen) {
          const isLocalDescriber =
            Number(pictureItState.describerId) === Number(currentUserId);
          localParticipant
            ?.setMicrophoneEnabled(isLocalDescriber)
            .catch(() => { });
        } else {
          localParticipant?.setMicrophoneEnabled(false).catch(() => { });
        }
      }
    }
  }, [
    gameState,
    gameType,
    pictureItState.describeStarted,
    pictureItState.ratingOpen,
    pictureItState.describerId,
    currentUserId,
    localParticipant,
  ]);

  const startGame = useCallback(
    (type = "crack_it", level = "easy", language = null) => {
      resetGameStates();
      const remoteIds =
        participants
          ?.map((p) => Number(p.identity))
          .filter((id) => !isNaN(id)) || [];
      const localId = Number(currentUserId);
      const rawPlayers = !isNaN(localId) ? [localId, ...remoteIds] : remoteIds;
      const players = [...new Set(rawPlayers)];

      if (players.length < 2) {
        toast.error(
          "Không đủ người chơi để bắt đầu trò chơi. Cần ít nhất 2 người!",
        );
        return;
      }

      const playerCount = players.length;

      if (connection.isConnected && roomId) {
        if (type === "picture-it" || type === "picture_it") {
          connection.send("StartPictureItGame", {
            RoomId: roomId || "general",
            Language: language || roomLanguage,
            Level: level,
            Players: players,
          });
        } else {
          connection.send("StartCrackItGame", {
            game_type: "crack_it",
            level,
            language: language || roomLanguage,
            roomId: roomId || "general",
            player_count: playerCount,
          });
        }
      }
    },
    [
      connection.isConnected,
      connection.send,
      roomLanguage,
      roomId,
      participants,
      currentUserId,
      resetGameStates,
    ],
  );

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (connection?.isConnected && roomId && isSpectator) {
        connection.send("PlayerLeaveGame", roomId);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [connection, roomId, isSpectator]);

  const spectateGame = useCallback(() => {
    if (connection.isConnected && roomId) {
      connection.send("SpectateGame", roomId);
    }
  }, [connection.isConnected, connection.send, roomId]);

  useEffect(() => {
    const handleHostStart = (e) => {
      if (gameState === "idle") {
        const detail = e.detail || {};
        startGame(
          detail.gameId || "crack_it",
          detail.level || "easy",
          detail.language,
        );
      }
    };
    window.addEventListener("hostStartGame", handleHostStart);
    return () => window.removeEventListener("hostStartGame", handleHostStart);
  }, [startGame, gameState]);

  // Crack IT Actions
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

  // Picture IT Actions
  const startPictureItDescribe = useCallback(() => {
    connection.send("PictureItDescribeStart", roomId || "general");
  }, [connection.send, roomId]);

  const endPictureItDescribe = useCallback(() => {
    localParticipant?.setMicrophoneEnabled(false).catch(() => { });
    connection.send("PictureItDescribeEnd", roomId || "general");
  }, [connection.send, roomId, localParticipant]);

  const submitPictureItFlag = useCallback(() => {
    connection.send("PictureItSubmitFlag", roomId || "general");
  }, [connection.send, roomId]);

  const submitPictureItRating = useCallback(
    (score) => {
      connection.send("PictureItSubmitRating", roomId || "general", score);
      setPictureItState((prev) => ({ ...prev, myRatingSubmitted: true }));
    },
    [connection.send, roomId],
  );

  // General Exit
  const exitGame = useCallback(() => {
    connection.send("PlayerLeaveGame", roomId || "general");

    // Keep track of the current game type before resetting
    const lastGameType = gameType;

    setGameState("idle");
    setGameType(null);
    resetGameStates();

    // Allow the player to spectate the game they just left (unless GAME_OVER is received)
    if (lastGameType) {
      setOngoingGame(true);
      setOngoingGameType(lastGameType);
    }
  }, [connection, roomId, resetGameStates, gameType]);

  const value = {
    gameState,
    gameType,
    gameLanguage,
    roomLanguage,
    countdown,
    currentRound,
    scores,
    roundResults,
    finalResults,
    leftPlayers,
    playerNames,
    spectatorIds,

    // Crack It specific
    puzzle,
    timer,
    correctPlayers,
    lastCorrectAnswer,
    incorrectAttempts,
    submitAnswer,

    // Picture It specific
    pictureIt: pictureItState,
    startPictureItDescribe,
    endPictureItDescribe,
    submitPictureItFlag,
    submitPictureItRating,

    // Actions
    ongoingGame,
    ongoingGameType,
    isSpectator,
    gamePlayers,
    spectateGame,
    startGame,
    exitGame,
    currentUserId,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
