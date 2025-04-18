import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../src/store/baseQuery";

export const leadApi = createApi({
  reducerPath: "leadApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Lead", "Followup"],
  endpoints: (builder) => ({
    getLeads: builder.query({
      query: (params) => ({
        url: "/leads",
        method: "GET",
        params,
      }),
      providesTags: ["Lead"],
    }),
    getLead: builder.query({
      query: (id) => ({
        url: `/leads/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Lead", id }],
    }),
    createLead: builder.mutation({
      query: (data) => ({
        url: "/leads",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Lead"],
    }),
    updateLead: builder.mutation({
      query: ({ id, data }) => ({
        url: `/leads/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Lead", id },
        "Lead",
      ],
    }),
    deleteLead: builder.mutation({
      query: (id) => ({
        url: `/leads/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Lead"],
    }),
    updateLeadStage: builder.mutation({
      query: ({ id, leadStage }) => ({
        url: `/leads/${id}`,
        method: "PUT",
        body: { leadStage }
      }),
      invalidatesTags: ["Lead"],
    }),
    uploadLeadFiles: builder.mutation({
      query: ({ id, data }) => ({
        url: `/leads/files/${id}`,
        method: "POST",
        body: data,
        formData: true, // This tells RTK Query that we're sending FormData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Lead", id },
        "Lead",
      ],
    }),
    getFollowups: builder.query({
      query: (id) => ({
        url: `/followups/${id}`,
        method: "GET"
      }),
      providesTags: ["Followup"]
    }),
    createFollowup: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/followups/${id}`,
        method: "POST",
        body: data
      }),
      invalidatesTags: ["Followup"]
    }),
    updateFollowup: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/followups/${id}`,
        method: "PUT",
        body: data
      }),
      invalidatesTags: ["Followup"]
    }),
    deleteFollowup: builder.mutation({
      query: (id) => ({
        url: `/followups/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Followup"]
    }),
    deleteLeadFile: builder.mutation({
      query: ({ id, filename }) => ({
        url: `/leads/files/${id}`,
        method: 'DELETE',
        body: { filename }
      }),
      invalidatesTags: ['Lead']
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useGetLeadQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useUpdateLeadStageMutation,
  useUploadLeadFilesMutation,
  useGetFollowupsQuery,
  useCreateFollowupMutation,
  useUpdateFollowupMutation,
  useDeleteFollowupMutation,
  useDeleteLeadFileMutation,
} = leadApi;
