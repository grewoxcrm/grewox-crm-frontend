import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const documentApi = createApi({
  reducerPath: "documentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Documents"],
  endpoints: (builder) => ({
    getDocuments: builder.query({
      query: () => "/documents",
      providesTags: ["Documents"],
    }),
    createDocument: builder.mutation({
      query: (data) => {
        const formData = new FormData();

        // Append all form fields
        Object.keys(data).forEach((key) => {
          if (key === "file") {
            // Handle file upload
            if (data[key]) {
              formData.append("file", data[key]);
            }
          } else {
            // Handle other fields
            formData.append(key, data[key]);
          }
        });

        return {
          url: "documents",
          method: "POST",
          body: formData,
          // Don't set Content-Type header, let the browser set it with boundary
        };
      },
      invalidatesTags: ["Documents"],
    }),
    updateDocument: builder.mutation({
      query: ({ id, data }) => {
        const formData = new FormData();

        // Append all form fields
        Object.keys(data).forEach((key) => {
          if (key === "file") {
            // Handle file upload
            if (data[key]) {
              formData.append("file", data[key]);
            }
          } else {
            // Handle other fields
            formData.append(key, data[key]);
          }
        });

        return {
          url: `documents/${id}`,
          method: "PUT",
          body: formData,
          // Don't set Content-Type header, let the browser set it with boundary
        };
      },
      invalidatesTags: ["Documents"],
    }),
    deleteDocument: builder.mutation({
      query: (id) => ({
        url: `documents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Documents"],
    }),
    getDocumentById: builder.query({
      query: (id) => `documents/${id}`,
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useGetDocumentByIdQuery,
} = documentApi;
