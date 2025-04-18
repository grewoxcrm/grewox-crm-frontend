import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const branchApi = createApi({
    reducerPath: 'branchApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Branches'],
    endpoints: (builder) => ({
        getAllBranches: builder.query({
            query: (params) => ({
                url: '/branches',
                method: 'GET',
                params: params,
            }),
            providesTags: ['Branches'],
        }),
        getBranchById: builder.query({
            query: (id) => `/branches/${id}`,
            providesTags: ['Branches'],
        }),
        createBranch: builder.mutation({
            query: (data) => ({
                url: '/branches',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Branches'],
        }),
        updateBranch: builder.mutation({
            query: ({ id, data }) => ({
                url: `/branches/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Branches'],
        }),
        deleteBranch: builder.mutation({
            query: (id) => ({
                url: `/branches/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Branches'],
        }),
    }),
});

export const {
    useGetAllBranchesQuery,
    useGetBranchByIdQuery,
    useCreateBranchMutation,
    useUpdateBranchMutation,
    useDeleteBranchMutation,
} = branchApi;

export default branchApi;
