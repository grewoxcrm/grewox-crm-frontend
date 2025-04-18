import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const jobOnboardingApi = createApi({
    reducerPath: 'jobOnboardingApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['JobOnboarding'],
    endpoints: (builder) => ({
        getAllJobOnboarding: builder.query({
            query: () => '/job-onboarding',
            providesTags: ['JobOnboarding'],
        }),
        createJobOnboarding: builder.mutation({
            query: (data) => ({
                url: 'job-onboarding',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['JobOnboarding'],
        }),
        
        updateJobOnboarding: builder.mutation({
            query: ({ id, data }) => ({
                url: `job-onboarding/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['JobOnboarding'],
        }),
        deleteJobOnboarding: builder.mutation({
            query: (id) => ({
                url: `job-onboarding/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['JobOnboarding'],
        }),
        getJobOnboardingById: builder.query({
            query: (id) => `job-onboarding/${id}`,
            providesTags: ['JobOnboarding'],
        }),
    }),
});

export const {
    useGetAllJobOnboardingQuery,
    useCreateJobOnboardingMutation,
    useUpdateJobOnboardingMutation,
    useDeleteJobOnboardingMutation,
    useGetJobOnboardingByIdQuery,
} = jobOnboardingApi;

export default jobOnboardingApi; 