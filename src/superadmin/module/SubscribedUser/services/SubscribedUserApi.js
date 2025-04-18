import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../store/baseQuery';

export const subscribedUserApi = createApi({
    reducerPath: 'subscribedUserApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['SubscribedUsers'],
    endpoints: (builder) => ({
        getAllSubscribedUsers: builder.query({
            query: () => '/subscriptions/assign',
            providesTags: ['SubscribedUsers'],
        }),
    }),
});

export const {
    useGetAllSubscribedUsersQuery,
} = subscribedUserApi;

export default subscribedUserApi;
