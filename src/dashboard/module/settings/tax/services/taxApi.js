import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const taxApi = createApi({
    reducerPath: 'taxApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Taxes'],
    endpoints: (builder) => ({
        getAllTaxes: builder.query({
            query: () => '/taxes',
            providesTags: ['Taxes'],
        }),
        createTax: builder.mutation({
            query: (data) => ({
                url: 'taxes',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Taxes'],
        }),
        updateTax: builder.mutation({
            query: ({ id, data }) => ({
                url: `taxes/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Taxes'],
        }),
        deleteTax: builder.mutation({
            query: (id) => ({
                url: `taxes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Taxes'],
        }),
    }),
});

export const {
    useGetAllTaxesQuery,
    useCreateTaxMutation,
    useUpdateTaxMutation,
    useDeleteTaxMutation,
} = taxApi;

export default taxApi;
