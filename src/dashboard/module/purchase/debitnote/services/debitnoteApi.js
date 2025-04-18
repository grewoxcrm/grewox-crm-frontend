import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";

export const debitNoteApi = createApi({
    reducerPath: "debitNoteApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["DebitNotes"],
    endpoints: (builder) => ({
        // Get all debit notes for a company
        getDebitNotes: builder.query({
            query: () => `/bill-debits`,
            providesTags: ["DebitNotes"],
        }),

        // Create new debit note
        createDebitNote: builder.mutation({
            query: (data) => ({
                url: `/bill-debits`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["DebitNotes"],
        }),

        // Delete debit note
        deleteDebitNote: builder.mutation({
            query: (id) => ({
                url: `/bill-debits/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["DebitNotes"],
        }),

    }),
});

export const {
    useGetDebitNotesQuery,
    useCreateDebitNoteMutation,
    useDeleteDebitNoteMutation,
} = debitNoteApi;