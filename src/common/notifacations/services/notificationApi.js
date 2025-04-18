import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../store/baseQuery';

export const notificationApi = createApi({
    reducerPath: 'notificationApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Notifications'],
    endpoints: (builder) => ({
        getAllNotifications: builder.query({
            query: (id) => `/notifications/${id}`,
            transformResponse: (response) => {
                // If response is already in the correct format, return it
                if (response?.success && Array.isArray(response?.data)) {
                    return response;
                }
                // Otherwise, transform the response
                const notifications = Array.isArray(response) ? response : response?.data || [];
                return {
                    data: notifications,
                    total: notifications.length,
                    success: true
                };
            },
            providesTags: ['Notifications']
        }),

        markAsRead: builder.mutation({
            query: (id) => ({
                url: `/notifications/${id}`,
                method: 'PUT',
                body: { read: true }
            }),
            invalidatesTags: ['Notifications']
        }),

        deleteNotification: builder.mutation({
            query: (id) => ({
                url: `/notifications/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Notifications']
        }),

       
    
    
     clearAllNotifications: builder.mutation({
                query: () => ({
                    url: '/notifications/clear',
                    method: 'DELETE'
                }),
                invalidatesTags: ['Notifications']
            })
    })
});

export const {
    useGetAllNotificationsQuery,
    useMarkAsReadMutation,
    useDeleteNotificationMutation,
    useClearAllNotificationsMutation
} = notificationApi; 