import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const interviewApi = createApi({
    reducerPath: 'interviewApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Interview'],
    endpoints: (builder) => ({
        getAllInterviews: builder.query({
            query: () => 'interview-schedules',
            providesTags: ['Interview'],
        }),

        createInterview: builder.mutation({
            query: (data) => ({
                url: 'interview-schedules',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Interview'],
        }),

        deleteInterview: builder.mutation({
            query: (id) => ({
                url: `interview-schedules/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Interview'],
        }),
    }),
});

export const {
    useGetAllInterviewsQuery,
    useCreateInterviewMutation,
    useDeleteInterviewMutation,
} = interviewApi;

export default interviewApi; 