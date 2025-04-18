import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const taskCalendarApi = createApi({
    reducerPath: 'taskCalendarApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['TaskCalendar'],
    endpoints: (builder) => ({
        getAllTaskCalendarEvents: builder.query({
            query: () => 'taskcalendars',
            providesTags: ['TaskCalendar'],
        }),

        createTaskCalendarEvent: builder.mutation({
            query: (data) => ({
                url: 'taskcalendars',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['TaskCalendar'],
        }),

        deleteTaskCalendarEvent: builder.mutation({
            query: (id) => ({
                url: `taskcalendars/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['TaskCalendar'],
        }),
    }),
});

export const {
    useGetAllTaskCalendarEventsQuery,
    useCreateTaskCalendarEventMutation,
    useDeleteTaskCalendarEventMutation,
} = taskCalendarApi;

export default taskCalendarApi;
