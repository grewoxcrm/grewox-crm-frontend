import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const contactApi = createApi({
  reducerPath: "contactApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Contacts"],
  endpoints: (builder) => ({
    getContacts: builder.query({
      query: () => "/contacts",
      providesTags: ["Contacts"],
    }),
    createContact: builder.mutation({
      query: (data) => ({
        url: "contacts",
        method: "POST", 
        body: data,
      }),
      invalidatesTags: ["Contacts"],
    }),
    updateContact: builder.mutation({
      query: ({ id, data }) => ({
        url: `contacts/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Contacts"],
    }),
    deleteContact: builder.mutation({
      query: (id) => ({
        url: `contacts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contacts"],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactApi;
