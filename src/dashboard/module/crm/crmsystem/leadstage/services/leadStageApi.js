import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../store/baseQuery";

export const leadStageApi = createApi({
  reducerPath: "leadStageApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["LeadStage"],
  endpoints: (builder) => ({
    getLeadStages: builder.query({
      query: () => "stages",
      transformResponse: (response) => {
        // Handle different response structures
        if (Array.isArray(response)) {
          return response;
        }
        if (response?.stages && Array.isArray(response.stages)) {
          return response.stages;
        }
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
      providesTags: ["LeadStage"],
    }),

    getLeadStagesByPipeline: builder.query({
      query: (pipelineId) => `stages/pipeline/${pipelineId}`,
      providesTags: ["LeadStage"],
    }),

    addLeadStage: builder.mutation({
      query: (body) => ({
        url: "stages",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LeadStage"],
    }),

    updateLeadStage: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `stages/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["LeadStage"],
    }),

    deleteLeadStage: builder.mutation({
      query: (id) => ({
        url: `stages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LeadStage"],
    }),
  }),
});

export const {
  useGetLeadStagesQuery,
  useGetLeadStagesByPipelineQuery,
  useAddLeadStageMutation,
  useUpdateLeadStageMutation,
  useDeleteLeadStageMutation,
} = leadStageApi;
