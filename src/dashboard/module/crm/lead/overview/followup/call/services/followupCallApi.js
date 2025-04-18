import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../../../store/baseQuery";

export const followupCallApi = createApi({
  reducerPath: "followupCallApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["FollowupCalls"],
  endpoints: (builder) => ({
    getFollowupCalls: builder.query({
      query: (id) => `/followup-calls/${id}`,
      providesTags: ["FollowupCalls"],
    }),
   
    getFollowuppCall: builder.query({
      query: () => `/followup-calls`,
      providesTags: ["FollowupCalls"],
    }),

    createFollowupCall: builder.mutation({
      query: ({id, data}) => ({
        url: `followup-calls/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["FollowupCalls"],
    }),
    updateFollowupCall: builder.mutation({
      query: ({ id, data }) => ({
        url: `followup-calls/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["FollowupCalls"],
    }),
    deleteFollowupCall: builder.mutation({
      query: (id) => ({
        url: `followup-calls/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FollowupCalls"],
    }),
  }),
});

export const {
  useGetFollowupCallsQuery,
  useGetFollowuppCallQuery,
  useCreateFollowupCallMutation,
  useUpdateFollowupCallMutation,
  useDeleteFollowupCallMutation,
} = followupCallApi;
