import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const leaveApi = createApi({
  reducerPath: "leaveApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Leave"],
  endpoints: (builder) => ({
    getLeave: builder.query({
      query: () => "/leaves",
      providesTags: ["Leave"],
    }),
    createLeave: builder.mutation({
      query: (data) => ({
        url: "leaves",
        method: "POST",
        body: data,
        formData: true,
      }),
      invalidatesTags: ["Leave"],
    }),
    updateLeave: builder.mutation({
      query: ({ id, data }) => ({
        url: `leaves/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Leave"],
    }),
    deleteLeave: builder.mutation({
      query: (id) => ({
        url: `leaves/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Leave"],
    }),
    approveLeave: builder.mutation({
      query: ({ id, data }) => ({
        url: `/leaves/approve/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Leave'],
    }),
  }),
});

export const {
  useGetLeaveQuery,
  useCreateLeaveMutation,
  useUpdateLeaveMutation,
  useDeleteLeaveMutation,
  useApproveLeaveMutation,
} = leaveApi;
