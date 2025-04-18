import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const jobApplicationApi = createApi({
    reducerPath: 'jobApplicationApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['JobApplications'],
    endpoints: (builder) => ({
        getAllJobApplications: builder.query({
            query: (params) => ({
                url: 'job-applications',
                method: 'GET',
                params: params,
            }),
            providesTags: ['JobApplications'],
        }),

        createJobApplication: builder.mutation({
            query: (data) => ({
                url: 'job-applications',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['JobApplications'],
        }),

        updateJobApplication: builder.mutation({
            query: ({ id, data }) => ({
                url: `job-applications/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['JobApplications'],
        }),

        deleteJobApplication: builder.mutation({
            query: (id) => ({
                url: `job-applications/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['JobApplications'],
        }),
    }),
});

export const {
    useGetAllJobApplicationsQuery,
    useCreateJobApplicationMutation,
    useUpdateJobApplicationMutation,
    useDeleteJobApplicationMutation,
} = jobApplicationApi;

export default jobApplicationApi; 