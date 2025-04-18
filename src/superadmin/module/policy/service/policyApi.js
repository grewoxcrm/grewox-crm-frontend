import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../store/baseQuery';

export const policyApi = createApi({
    reducerPath: 'policyApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Policies'],
    endpoints: (builder) => ({
        getAllPolicies: builder.query({
            query: () => '/policies',
            transformResponse: (response) => {
                console.log('Raw API Response:', response);
                const policies = Array.isArray(response) ? response : response?.data || [];
                return {
                    data: policies,
                    total: policies.length,
                    success: true
                };
            },
            transformErrorResponse: (response) => {
                console.error('API Error:', response);
                return {
                    data: [],
                    total: 0,
                    success: false,
                    error: response.data?.message || 'Failed to fetch policies'
                };
            },
            providesTags: ['Policies']
        }),

        getPolicyById: builder.query({
            query: (id) => `/policies/${id}`,
            providesTags: (result, error, id) => [{ type: 'Policies', id }]
        }),

        createPolicy: builder.mutation({
            query: (data) => ({
                url: '/policies',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['Policies']
        }),

        updatePolicy: builder.mutation({
            query: ({ id, data }) => ({
                url: `/policies/${id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: ['Policies']
        }),

        deletePolicy: builder.mutation({
            query: (id) => ({
                url: `/policies/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Policies']
        })
    })
});

export const {
    useGetAllPoliciesQuery,
    useGetPolicyByIdQuery,
    useCreatePolicyMutation,
    useUpdatePolicyMutation,
    useDeletePolicyMutation
} = policyApi; 