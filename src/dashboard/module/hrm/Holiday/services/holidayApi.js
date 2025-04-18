import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const holidayApi = createApi({
    reducerPath: 'holidayApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Holidays'],
    endpoints: (builder) => ({
        getAllHolidays: builder.query({
            query: (params) => ({
                url: '/holidays',
                method: 'GET',
                params: params,
            }),
            providesTags: ['Holidays'],
        }),
        createHoliday: builder.mutation({
            query: (data) => ({
                url: '/holidays',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Holidays'],
        }),
        updateHoliday: builder.mutation({
            query: ({ id, data }) => ({
                url: `/holidays/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Holidays'],
        }),
        deleteHoliday: builder.mutation({
            query: (id) => ({
                url: `/holidays/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Holidays'],
        }),
    }),
});

export const {
    useGetAllHolidaysQuery,
    useCreateHolidayMutation,
    useUpdateHolidayMutation,
    useDeleteHolidayMutation,
} = holidayApi;

export default holidayApi;
