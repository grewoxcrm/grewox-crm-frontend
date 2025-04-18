import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../store/baseQuery";

export const notesApi = createApi({
  reducerPath: "notesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Notes"],
  endpoints: (builder) => ({
    getAllNotes: builder.query({
      query: (id) => ({
        url: `/notes/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        // Transform the nested response to a flatter structure
        return response.data || [];
      },
      providesTags: ["Notes"],
    }),
    createNotes: builder.mutation({
      query: ({ id, data }) => ({
        url: `/notes/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notes"],
    }),
    updateNotes: builder.mutation({
      query: ({ id, data }) => ({
        url: `/notes/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Notes"],
    }),
    deleteNotes: builder.mutation({
      query: (id) => ({
        url: `/notes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notes"],
    }),
  }),
});

export const {
  useGetAllNotesQuery,
  useCreateNotesMutation,
  useUpdateNotesMutation,
  useDeleteNotesMutation,
} = notesApi;
