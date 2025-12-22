import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const restartApi = createApi({
  reducerPath: 'restartApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/restart/',
  }),
  tagTypes: ['Restart'],
  endpoints: (builder) => ({
    isRestart: builder.query<boolean, void>({
      query: () => ``,
      transformResponse: (response: any): boolean => {
        return response.restart === true;
      },
      providesTags: ['Restart'],
    }),
    setRestarted: builder.mutation<void, void>({
      query: () => ({
        url: ``,
        method: 'POST',
      }),
      invalidatesTags: ['Restart'],
    }),
  }),
});

export const {
  useIsRestartQuery,
  useSetRestartedMutation,
} = restartApi;