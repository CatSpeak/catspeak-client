import { baseApi } from './baseApi';

export const pictureItApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    startGame: builder.mutation({
      query: (body) => ({
        url: '/PictureIt/game/start',
        method: 'POST',
        body,
      }),
    }),
    startRound: builder.mutation({
      query: (body) => ({
        url: '/PictureIt/round/start',
        method: 'POST',
        body,
      }),
    }),
    endRound: builder.mutation({
      query: (roundId) => ({
        url: `/PictureIt/round/${roundId}/end`,
        method: 'POST',
      }),
    }),
    submitRating: builder.mutation({
      query: (body) => ({
        url: '/PictureIt/rating/submit',
        method: 'POST',
        body,
      }),
    }),
    endGame: builder.mutation({
      query: (gameId) => ({
        url: `/PictureIt/game/${gameId}/end`,
        method: 'POST',
      }),
    }),
    getGameResult: builder.query({
      query: (gameId) => `/PictureIt/game/${gameId}/result`,
    }),
  }),
});

export const {
  useStartGameMutation,
  useStartRoundMutation,
  useEndRoundMutation,
  useSubmitRatingMutation,
  useEndGameMutation,
  useGetGameResultQuery,
  useLazyGetGameResultQuery,
} = pictureItApi;
