import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const proposalApi = createApi({
    reducerPath: 'proposalApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Proposals'],
    endpoints: (builder) => ({
        getAllProposals: builder.query({
            query: (params) => ({
                url: 'proposals',
                method: 'GET',
                params: params,
            }),
            providesTags: ['Proposals'],
        }),

        createProposal: builder.mutation({
            query: (data) => ({
                url: 'proposals',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Proposals'],
        }),

        updateProposal: builder.mutation({
            query: ({ id, data }) => ({
                url: `proposals/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Proposals'],
        }),

        deleteProposal: builder.mutation({
            query: (id) => ({
                url: `proposals/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Proposals'],
        }),
    }),
});

export const {
    useGetAllProposalsQuery,
    useCreateProposalMutation,
    useUpdateProposalMutation,
    useDeleteProposalMutation,
} = proposalApi;

export default proposalApi;
