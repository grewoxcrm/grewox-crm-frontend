import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const attendanceApi = createApi({
    reducerPath: 'attendanceApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Attendances'],
    endpoints: (builder) => ({
        getAllAttendances: builder.query({
            query: (params) => ({
                url: '/attendance',
                method: 'GET',
                params: params,
            }),
            providesTags: ['Attendances'],
        }),
        createAttendance: builder.mutation({
            query: (data) => ({
                url: '/attendance',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Attendances'],
        }),
    }),
});

export const {
    useGetAllAttendancesQuery,
    useCreateAttendanceMutation,
} = attendanceApi;

export default attendanceApi;
