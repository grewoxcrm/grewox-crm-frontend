import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const calendarApi = createApi({
    reducerPath: 'calendarApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Calendar'],
    endpoints: (builder) => ({
        getAllCalendarEvents: builder.query({
            query: () => 'calendar',
            providesTags: ['Calendar'],
        }),

        createCalendarEvent: builder.mutation({
            query: (data) => ({
                url: 'calendar',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Calendar'],
        }),

        deleteCalendarEvent: builder.mutation({
            query: (id) => ({
                url: `calendar/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Calendar'],
        }),
    }),
});

export const {
    useGetAllCalendarEventsQuery,
    useCreateCalendarEventMutation,
    useDeleteCalendarEventMutation,
} = calendarApi;

export default calendarApi;
