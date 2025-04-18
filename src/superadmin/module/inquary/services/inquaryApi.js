import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../store/baseQuery';

export const inquiryApi = createApi({
    reducerPath: 'inquiryApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['inquiry'],
    endpoints: (builder) => ({
        getAllInquiries: builder.query({
            query: () => ({
                url: '/inquiry',
                method: 'GET',
            }),
            providesTags: ['inquiry'],
        }),
        createInquiry: builder.mutation({
            query: (data) => ({
                url: '/inquiry',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['inquiry'],
        }),
        updateInquiry: builder.mutation({
            query: ({ id, data }) => ({
                url: `/inquiry/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['inquiry'],
        }),
        deleteInquiry: builder.mutation({
            query: (id) => ({
                url: `/inquiry/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['inquiry'],
        })
    }),
});

export const {
    useGetAllInquiriesQuery,
    useCreateInquiryMutation,
    useUpdateInquiryMutation,
    useDeleteInquiryMutation
} = inquiryApi;
