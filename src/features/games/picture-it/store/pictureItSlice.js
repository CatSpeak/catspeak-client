import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  gameState: 'Idle', // Idle | Setup | Countdown | Preparing | Describing | Rating | Result | GameOver
  gameId: null,
  sessionId: null,
  config: {
    language: 'English',
    difficulty: 'Medium',
    totalRounds: 5,
  },
  currentRound: {
    roundId: null,
    roundNumber: 1,
    describerId: null,
    imageUrl: null,
    category: null,
    forbiddenWords: [],
  },
  ratings: [],
  leaderboard: [],
  isHost: false, // In a video call, usually the one who starts the game is the host
  countdown: 0,
};

const pictureItSlice = createSlice({
  name: 'pictureIt',
  initialState,
  reducers: {
    setGameState: (state, action) => {
      state.gameState = action.payload;
    },
    setGameSession: (state, action) => {
      const { gameId, sessionId, config, isHost } = action.payload;
      state.gameId = gameId;
      state.sessionId = sessionId;
      state.config = { ...state.config, ...config };
      state.isHost = isHost ?? state.isHost;
    },
    setRound: (state, action) => {
      state.currentRound = { ...state.currentRound, ...action.payload };
    },
    addRating: (state, action) => {
      state.ratings.push(action.payload);
    },
    setLeaderboard: (state, action) => {
      state.leaderboard = action.payload;
    },
    setCountdown: (state, action) => {
      state.countdown = action.payload;
    },
    resetGame: () => initialState,
    // Sync reducer: entirely replaces state based on backend/host broadcast
    syncGameState: (state, action) => {
      return { ...state, ...action.payload, isHost: state.isHost }; // preserve local isHost flag
    }
  },
});

export const {
  setGameState,
  setGameSession,
  setRound,
  addRating,
  setLeaderboard,
  setCountdown,
  resetGame,
  syncGameState,
} = pictureItSlice.actions;

export default pictureItSlice.reducer;
