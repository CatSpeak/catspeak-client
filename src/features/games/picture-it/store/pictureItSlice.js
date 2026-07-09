import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Game lifecycle
  gameState: 'Idle', // Idle | Countdown | Playing | Describing | Rating | Result | GameOver | ForceStopped
  gameId: null,
  sessionId: null,

  // Config
  config: {
    language: 'English',
    difficulty: 'easy',
    totalRounds: 0,
  },

  // Players locked at game start
  players: [],          // list of playerIds in the game
  describerOrder: [],   // locked order of describers (2x shuffle)
  isHost: false,
  isSpectator: false,

  // Current round info
  currentRound: {
    roundNumber: 1,
    describerId: null,
    imageUrl: null,         // full url (Describer only) or blur url (Rater)
    imageUrlFull: null,     // revealed after DESCRIBE_ENDED
    imageBlurred: true,     // true = blur active for Raters
    category: null,
    forbiddenWords: [],
    tags: [],
    describeStarted: false, // true when describer clicks start
  },

  // Flag system
  flagCount: 0,
  raterCount: 0,

  // Rating phase
  ratingOpen: false,
  ratingCountdownSec: 0,
  myRatingSubmitted: false,

  // Scores
  cumulativeScores: {},   // { playerId: score }
  leaderboard: [],        // sorted for display

  // Game over
  badges: {},             // { playerId: badgeString }
  winnerIds: [],

  countdown: 0,
};

const pictureItSlice = createSlice({
  name: 'pictureIt',
  initialState,
  reducers: {
    // ── Lifecycle ────────────────────────────────────────────
    setGameState: (state, action) => {
      state.gameState = action.payload;
    },
    setCountdown: (state, action) => {
      state.countdown = action.payload;
    },
    setGameSession: (state, action) => {
      const { gameId, sessionId, config, isHost, players, describerOrder } = action.payload;
      if (gameId !== undefined) state.gameId = gameId;
      if (sessionId !== undefined) state.sessionId = sessionId;
      if (config) state.config = { ...state.config, ...config };
      if (isHost !== undefined) state.isHost = isHost;
      if (players) state.players = players;
      if (describerOrder) state.describerOrder = describerOrder;
    },

    // ── Round ────────────────────────────────────────────────
    setRoundStart: (state, action) => {
      // For Raters: receives blurred image
      const { round, total, describerId, imageUrlBlur, category, tags } = action.payload;
      state.currentRound.roundNumber = round;
      state.config.totalRounds = total;
      state.currentRound.describerId = describerId;
      state.currentRound.imageUrl = imageUrlBlur || null;
      state.currentRound.imageUrlFull = null;
      state.currentRound.imageBlurred = true;
      state.currentRound.category = category;
      state.currentRound.forbiddenWords = [];
      state.currentRound.tags = tags || [];
      state.currentRound.describeStarted = false;
      state.flagCount = 0;
      state.raterCount = 0;
      state.ratingOpen = false;
      state.myRatingSubmitted = false;
      state.gameState = 'Describing';
    },

    setRoundStartDescriber: (state, action) => {
      // For Describer: receives full image + forbidden words
      const { round, total, describerId, imageUrlFull, category, forbiddenWords, tags } = action.payload;
      state.currentRound.roundNumber = round;
      state.config.totalRounds = total;
      if (describerId) state.currentRound.describerId = describerId;
      state.currentRound.imageUrl = imageUrlFull;
      state.currentRound.imageUrlFull = imageUrlFull;
      state.currentRound.imageBlurred = false;
      state.currentRound.category = category;
      state.currentRound.forbiddenWords = forbiddenWords || [];
      state.currentRound.tags = tags || [];
      state.currentRound.describeStarted = false;
      state.flagCount = 0;
      state.ratingOpen = false;
      state.myRatingSubmitted = false;
      state.gameState = 'Describing';
    },

    revealImage: (state, action) => {
      // DESCRIBE_ENDED — reveal full image to everyone
      const { imageUrlFull } = action.payload;
      state.currentRound.imageUrlFull = imageUrlFull;
      state.currentRound.imageBlurred = false;
      if (imageUrlFull) state.currentRound.imageUrl = imageUrlFull;
    },

    // ── Flag ────────────────────────────────────────────────
    updateFlagCount: (state, action) => {
      state.flagCount = action.payload.flagCount;
      state.raterCount = action.payload.raterCount;
    },
    
    // ── Describe Started ──────────────────────────────────────
    setDescribeStarted: (state) => {
      state.currentRound.describeStarted = true;
    },

    // ── Round Flagged/Skipped ───────────────────────────────
    setRoundSkipped: (state, action) => {
      // Just visually reset state, wait for server to send next ROUND_START
      state.ratingOpen = false;
      state.gameState = 'Idle'; 
    },

    // ── Rating ───────────────────────────────────────────────
    openRating: (state, action) => {
      state.ratingOpen = true;
      state.ratingCountdownSec = action.payload.countdownSeconds || 15;
      state.gameState = 'Rating';
    },
    closeRating: (state) => {
      state.ratingOpen = false;
    },
    setMyRatingSubmitted: (state) => {
      state.myRatingSubmitted = true;
    },
    tickRatingCountdown: (state) => {
      if (state.ratingCountdownSec > 0) state.ratingCountdownSec -= 1;
    },

    // ── Result ───────────────────────────────────────────────
    setRoundResult: (state, action) => {
      const { cumulativeScores } = action.payload;
      state.cumulativeScores = cumulativeScores || {};
      // Build sorted leaderboard
      state.leaderboard = Object.entries(cumulativeScores || {})
        .map(([id, score]) => ({ id: Number(id), score }))
        .sort((a, b) => b.score - a.score)
        .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
      state.gameState = 'Result';
    },

    // ── Game Over ────────────────────────────────────────────
    setGameOver: (state, action) => {
      const { finalScores, winnerIds, badges } = action.payload;
      state.cumulativeScores = finalScores || {};
      state.winnerIds = winnerIds || [];
      state.badges = badges || {};
      state.leaderboard = Object.entries(finalScores || {})
        .map(([id, score]) => ({ id: Number(id), score }))
        .sort((a, b) => b.score - a.score)
        .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
      state.gameState = 'GameOver';
    },

    // ── Spectator ────────────────────────────────────────────
    setSpectator: (state) => {
      state.isSpectator = true;
    },

    // ── Sync (full state from server on reconnect) ────────────
    syncFromServer: (state, action) => {
      const {
        currentRound, totalRounds, describerId, describerOrder,
        cumulativeScores, imageUrlBlur, imageUrl, forbiddenWords,
        ratingOpen, isSpectator, language
      } = action.payload;

      state.currentRound.roundNumber = currentRound || state.currentRound.roundNumber;
      state.config.totalRounds = totalRounds || state.config.totalRounds;
      state.currentRound.describerId = describerId;
      state.describerOrder = describerOrder || state.describerOrder;
      state.cumulativeScores = cumulativeScores || {};
      state.ratingOpen = ratingOpen || false;
      state.isSpectator = isSpectator || false;
      state.config.language = language || state.config.language;

      if (imageUrlBlur) {
        state.currentRound.imageUrl = imageUrlBlur;
        state.currentRound.imageBlurred = true;
      } else if (imageUrl) {
        state.currentRound.imageUrl = imageUrl;
        state.currentRound.imageBlurred = false;
      }
      if (forbiddenWords) state.currentRound.forbiddenWords = forbiddenWords;
    },

    // ── Force Stop ───────────────────────────────────────────
    setForceStop: (state, action) => {
      state.gameState = 'ForceStopped';
      state.cumulativeScores = action.payload?.currentScores || state.cumulativeScores;
    },

    resetGame: () => initialState,
  },
});

export const {
  setGameState,
  setCountdown,
  setGameSession,
  setRoundStart,
  setRoundStartDescriber,
  revealImage,
  updateFlagCount,
  openRating,
  closeRating,
  setMyRatingSubmitted,
  tickRatingCountdown,
  setRoundResult,
  setGameOver,
  setSpectator,
  syncFromServer,
  setForceStop,
  resetGame,
  setDescribeStarted,
  setRoundSkipped,
} = pictureItSlice.actions;

export default pictureItSlice.reducer;
