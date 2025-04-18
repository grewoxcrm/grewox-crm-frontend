import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../../../store/baseQuery";

export const followupMeetingApi = createApi({
  reducerPath: "followupMeetingApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["FollowupMeetings"],
  endpoints: (builder) => ({
    getFollowupMeetings: builder.query({
      query: (id) => `/followup-meetings/${id}`,
      providesTags: ["FollowupMeetings"],
    }),
    getFollowupMeetingById: builder.query({
      query: (id) => `/followup-meetings/${id}`,
      providesTags: ["FollowupMeetings"],
    }),
    createFollowupMeeting: builder.mutation({
      query: ({id, data}) => ({
        url: `followup-meetings/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["FollowupMeetings"],
    }),
    updateFollowupMeeting: builder.mutation({
      query: ({ id, data }) => ({
        url: `followup-meetings/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["FollowupMeetings"],
    }),
    deleteFollowupMeeting: builder.mutation({
      query: (id) => ({
        url: `followup-meetings/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FollowupMeetings"],
    }),
  }),
});

export const {
  useGetFollowupMeetingsQuery,
  useGetFollowupMeetingByIdQuery,
  useCreateFollowupMeetingMutation,
  useUpdateFollowupMeetingMutation,
  useDeleteFollowupMeetingMutation,
} = followupMeetingApi;
