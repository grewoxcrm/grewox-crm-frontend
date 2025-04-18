import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const subclientApi = createApi({
    reducerPath: 'subclientApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Subclient'],
    endpoints: (builder) => ({
        getAllSubclients: builder.query({
            query: () => ({
                url: '/sub-clients',
                method: 'GET'
            }),
            providesTags: ['Subclient'],
        }),

        getSubclientById: builder.query({
            query: (id) => ({
                url: `/sub-clients/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'Subclient', id }],
        }),

        createSubclient: builder.mutation({
            query: (data) => ({
                url: '/sub-clients',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['Subclient'],
        }),

        verifySignup: builder.mutation({
            query: ({ otp, token }) => ({
                url: '/auth/verify-signup',
                method: 'POST',
                body: { otp },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }),
            invalidatesTags: ['Subclient']
        }),

        resendSignupOtp: builder.mutation({
            query: ({ token }) => ({
                url: '/auth/resend-signup-otp',
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        }),

        updateSubclient: builder.mutation({
            query: ({ id, data }) => ({
                url: `/sub-clients/${id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Subclient', id },
                'Subclient'
            ]
        }),

        deleteSubclient: builder.mutation({
            query: (id) => ({
                url: `/sub-clients/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Subclient']
        })
    })
});

export const {
    useGetAllSubclientsQuery,
    useGetSubclientByIdQuery,
    useCreateSubclientMutation,
    useUpdateSubclientMutation,
    useDeleteSubclientMutation,
    useVerifySignupMutation,
    useResendSignupOtpMutation
} = subclientApi;
