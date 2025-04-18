import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const jobApi = createApi({
    reducerPath: 'jobApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Jobs'],
    endpoints: (builder) => ({
        getAllJobs: builder.query({
            query: () => '/jobs',
            providesTags: ['Jobs'],
        }),
        createJob: builder.mutation({
            query: (data) => ({
                url: 'jobs',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Jobs'],
        }),
        updateJob: builder.mutation({
            query: ({ id, data }) => ({
                url: `jobs/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Jobs'],
        }),
        deleteJob: builder.mutation({
            query: (id) => ({
                url: `jobs/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Jobs'],
        }),

    }),
});

export const {
    useGetAllJobsQuery,
    useCreateJobMutation,
    useUpdateJobMutation,
    useDeleteJobMutation,
} = jobApi;

export default jobApi;
