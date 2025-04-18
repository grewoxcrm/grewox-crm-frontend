import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../store/baseQuery";

export const pipelineApi = createApi({
  reducerPath: "pipelineApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Pipeline"],
  endpoints: (builder) => ({
    getPipelines: builder.query({
      query: () => "/pipelines",
      transformResponse: (response) => {
        // Handle different response structures
        if (Array.isArray(response)) {
          return response;
        }
        if (response?.pipelines && Array.isArray(response.pipelines)) {
          return response.pipelines;
        }
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      },
      providesTags: ["Pipeline"],
    }),
    addPipeline: builder.mutation({
      query: (data) => ({
        url: "/pipelines",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Pipeline"],
    }),
    updatePipeline: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/pipelines/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Pipeline"],
    }),
    deletePipeline: builder.mutation({
      query: (id) => ({
        url: `/pipelines/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Pipeline"],
    }),
  }),
});

export const {
  useGetPipelinesQuery,
  useAddPipelineMutation,
  useUpdatePipelineMutation,
  useDeletePipelineMutation,
} = pipelineApi;
