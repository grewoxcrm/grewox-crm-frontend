import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../store/baseQuery";

export const dealStageApi = createApi({
  reducerPath: "dealStageApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["DealStage"],
  endpoints: (builder) => ({
    getDealStages: builder.query({
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
      providesTags: ["DealStage"],
    }),

    getDealStagesByPipeline: builder.query({
      query: (pipelineId) => `stages/pipeline/${pipelineId}`,
      providesTags: ["DealStage"],
    }),

    addDealStage: builder.mutation({
      query: (body) => ({
        url: "stages",
        method: "POST",
        body,
      }),
      invalidatesTags: ["DealStage"],
    }),

    updateDealStage: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `stages/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["DealStage"],
    }),

    deleteDealStage: builder.mutation({
      query: (id) => ({
        url: `stages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DealStage"],
    }),
  }),
});

export const {
  useGetDealStagesQuery,
  useGetDealStagesByPipelineQuery,
  useAddDealStageMutation,
  useUpdateDealStageMutation,
  useDeleteDealStageMutation,
} = dealStageApi;
