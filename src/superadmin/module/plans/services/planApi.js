import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../store/baseQuery';

export const planApi = createApi({
    reducerPath: 'planApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Subscriptions'],
    endpoints: (builder) => ({
        getAllPlans: builder.query({
            query: ({ page = 1, limit = 10, search = '' }) => ({
                url: `/subscriptions`,
                method: 'GET',
                params: { page, limit, search }
            }),
            providesTags: ['Subscriptions']
        }),

        getPlanById: builder.query({
            query: (id) => ({
                url: `/subscriptions/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'Subscriptions', id }]
        }),

        createPlan: builder.mutation({
            query: (data) => ({
                url: '/subscriptions',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['Subscriptions']
        }),

        updatePlan: builder.mutation({
            query: ({ idd, updateData }) => ({
                url: `/subscriptions/${idd}`,
                method: 'PUT',
                body: updateData
            }),
            invalidatesTags: (result, error, { idd }) => [
                { type: 'Subscriptions', idd },
                'Subscriptions'
            ]
        }),

        deletePlan: builder.mutation({
            query: (id) => ({
                url: `/subscriptions/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Subscriptions']
        }),
    })
});

export const {
    useGetAllPlansQuery,
    useGetPlanByIdQuery,
    useCreatePlanMutation,
    useUpdatePlanMutation,
    useDeletePlanMutation,
} = planApi;