import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../store/baseQuery';

export const storageApi = createApi({
    reducerPath: 'storageApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Storage'],
    endpoints: (builder) => ({
        getClientStorage: builder.query({
            query: () => ({
                url: '/clients/storage',
                method: 'GET',
            }),
            providesTags: ['Storage'],
        }),
        getClientStorageUsage: builder.query({
            query: (clientId) => ({
                url: `/clients/storage/${clientId}`,
                method: 'GET',
            }),
            providesTags: ['Storage'],
        }),
        updateClientStorage: builder.mutation({
            query: ({ clientId, data }) => ({
                url: `/clients/storage/${clientId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Storage'],
        }),
        deleteClientStorage: builder.mutation({
            query: (clientId) => ({
                url: `/clients/storage/${clientId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Storage'],
        }),
    }),
});

export const {
    useGetClientStorageQuery,
    useGetClientStorageUsageQuery,
    useUpdateClientStorageMutation,
    useDeleteClientStorageMutation,
} = storageApi;