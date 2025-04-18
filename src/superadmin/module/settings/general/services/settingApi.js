import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const settingApi = createApi({
    reducerPath: 'settingApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Settings'],
    endpoints: (builder) => ({
        createSetting: builder.mutation({
            query: (data) => ({
                url: '/settings',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Settings'],
        }),
        getAllSettings: builder.query({
            query: () => '/settings',
            providesTags: ['Settings'],
        }),
        deleteSetting: builder.mutation({
            query: (id) => ({
                url: `/settings/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Settings'],
        }),
    }),
});

export const {
    useCreateSettingMutation,
    useGetAllSettingsQuery,
    useDeleteSettingMutation,
} = settingApi;
