import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../../../store/baseQuery";

export const followupTaskApi = createApi({
  reducerPath: "followupTaskApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["FollowupTasks"],
  endpoints: (builder) => ({
    getFollowupTasks: builder.query({
      query: (id) => `/followup-tasks/${id}`,
      providesTags: ["FollowupTasks"],
    }),
    getFollowupTaskById: builder.query({
      query: (id) => `/followup-tasks/${id}`,
      providesTags: ["FollowupTasks"],
    }),
    createFollowupTask: builder.mutation({
      query: ({id, data}) => ({
        url: `followup-tasks/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["FollowupTasks"],
    }),
    updateFollowupTask: builder.mutation({
      query: ({ id, data }) => ({
        url: `followup-tasks/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["FollowupTasks"],
    }),
    deleteFollowupTask: builder.mutation({
      query: (id) => ({
        url: `followup-tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FollowupTasks"],
    }),
  }),
});

export const {
  useGetFollowupTasksQuery,
  useGetFollowupTaskByIdQuery,
  useCreateFollowupTaskMutation,
  useUpdateFollowupTaskMutation,
  useDeleteFollowupTaskMutation,
} = followupTaskApi;
