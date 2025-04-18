import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../store/baseQuery";

export const sourceApi = createApi({
  reducerPath: "sourceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Sources", "Statuses", "Tags", "Labels", "ContractTypes", "Categories", "FollowupTypes "],
  endpoints: (builder) => ({
    // Sources
    getSources: builder.query({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return { data: response.filter(item => item.lableType === "source") };
        }
        if (response?.data && Array.isArray(response.data)) {
          return { data: response.data.filter(item => item.lableType === "source") };
        }
        return { data: [] };
      },
      providesTags: ["Sources"],
    }),
    createSource: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "POST",
        body: {
          ...data,
          lableType: "source",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to create source",
      }),
      invalidatesTags: ["Sources"],
    }),
    updateSource: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "PUT",
        body: {
          ...data,
          lableType: "source",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to update source",
      }),
      invalidatesTags: ["Sources"],
    }),
    deleteSource: builder.mutation({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to delete source",
      }),
      invalidatesTags: ["Sources"],
    }),

    // Statuses
    getStatuses: builder.query({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return { data: response.filter(item => item.lableType === "status") };
        }
        if (response?.data && Array.isArray(response.data)) {
          return { data: response.data.filter(item => item.lableType === "status") };
        }
        return { data: [] };
      },
      providesTags: ["Statuses"],
    }),
    createStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "POST",
        body: {
          ...data,
          lableType: "status",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to create status",
      }),
      invalidatesTags: ["Statuses"],
    }),
    updateStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "PUT",
        body: {
          ...data,
          lableType: "status",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to update status",
      }),
      invalidatesTags: ["Statuses"],
    }),
    deleteStatus: builder.mutation({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to delete status",
      }),
      invalidatesTags: ["Statuses"],
    }),

    // Tags
    getTags: builder.query({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return { data: response.filter(item => item.lableType === "tag") };
        }
        if (response?.data && Array.isArray(response.data)) {
          return { data: response.data.filter(item => item.lableType === "tag") };
        }
        return { data: [] };
      },
      providesTags: ["Tags"],
    }),
    createTag: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "POST",
        body: {
          ...data,
          lableType: "tag",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to create tag",
      }),
      invalidatesTags: ["Tags"],
    }),
    updateTag: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "PUT",
        body: {
          ...data,
          lableType: "tag",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to update tag",
      }),
      invalidatesTags: ["Tags"],
    }),
    deleteTag: builder.mutation({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to delete tag",
      }),
      invalidatesTags: ["Tags"],
    }),

    // Labels
    getLabels: builder.query({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return { data: response.filter(item => item.lableType === "label") };
        }
        if (response?.data && Array.isArray(response.data)) {
          return { data: response.data.filter(item => item.lableType === "label") };
        }
        return { data: [] };
      },
      providesTags: ["Labels"],
    }),
    createLabel: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "POST",
        body: {
          ...data,
          lableType: "label",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to create label",
      }),
      invalidatesTags: ["Labels"],
    }),
    updateLabel: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "PUT",
        body: {
          ...data,
          lableType: "label",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to update label",
      }),
      invalidatesTags: ["Labels"],
    }),
    deleteLabel: builder.mutation({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to delete label",
      }),
      invalidatesTags: ["Labels"],
    }),

    // Categories
    getCategories: builder.query({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return { data: response.filter(item => item.lableType === "category") };
        }
        if (response?.data && Array.isArray(response.data)) {
          return { data: response.data.filter(item => item.lableType === "category") };
        }
        return { data: [] };
      },
      providesTags: ["Categories"],
    }),
    createCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "POST",
        body: {
          ...data,
          lableType: "category",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to create category",
      }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "PUT",
        body: {
          ...data,
          lableType: "category",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to update category",
      }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to delete category",
      }),
      invalidatesTags: ["Categories"],
    }),

    // Contract Types
    getContractTypes: builder.query({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return { data: response.filter(item => item.lableType === "contract_type") };
        }
        if (response?.data && Array.isArray(response.data)) {
          return { data: response.data.filter(item => item.lableType === "contract_type") };
        }
        return { data: [] };
      },
      providesTags: ["ContractTypes"],
    }),
    createContractType: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "POST",
        body: {
          ...data,
          lableType: "contract_type",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to create contract type",
      }),
      invalidatesTags: ["ContractTypes"],
    }),
    updateContractType: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "PUT",
        body: {
          ...data,
          lableType: "contractType",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to update contract type",
      }),
      invalidatesTags: ["ContractTypes"],
    }),
    deleteContractType: builder.mutation({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to delete contract type",
      }),
      invalidatesTags: ["ContractTypes"],
    }),

    // Followup Types
    getFollowupTypes: builder.query({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return { data: response.filter(item => item.lableType === "followup") };
        }
        if (response?.data && Array.isArray(response.data)) {
          return { data: response.data.filter(item => item.lableType === "followup") };
        }
        return { data: [] };
      },
      providesTags: ["FollowupTypes"],
    }),
    createFollowupType: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "POST",
        body: {
          ...data,
          lableType: "followup",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to create followup type",
      }),
      invalidatesTags: ["FollowupTypes"],
    }),
    updateFollowupType: builder.mutation({
      query: ({ id, data }) => ({
        url: `/labels/${id}`,
        method: "PUT",
        body: {
          ...data,
          lableType: "followup",
        },
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to update followup type",
      }),
      invalidatesTags: ["FollowupTypes"],
    }),
    deleteFollowupType: builder.mutation({
      query: (id) => ({
        url: `/labels/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => response?.data || response,
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || "Failed to delete followup type",
      }),
      invalidatesTags: ["FollowupTypes"],
    }),
  }),
});

export const {
  // Sources
  useGetSourcesQuery,
  useCreateSourceMutation,
  useUpdateSourceMutation,
  useDeleteSourceMutation,
  // Statuses
  useGetStatusesQuery,
  useCreateStatusMutation,
  useUpdateStatusMutation,
  useDeleteStatusMutation,
  // Tags
  useGetTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
  // Labels
  useGetLabelsQuery,
  useCreateLabelMutation,
  useUpdateLabelMutation,
  useDeleteLabelMutation,
  // Categories
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  // Contract Types
  useGetContractTypesQuery,
  useCreateContractTypeMutation,
  useUpdateContractTypeMutation,
  useDeleteContractTypeMutation,
  // Followup Types
  useGetFollowupTypesQuery,
  useCreateFollowupTypeMutation,
  useUpdateFollowupTypeMutation,
  useDeleteFollowupTypeMutation,
} = sourceApi;
