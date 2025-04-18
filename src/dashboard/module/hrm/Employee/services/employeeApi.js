import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const employeeApi = createApi({
    reducerPath: 'employeeApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Employees'],
    endpoints: (builder) => ({
        getEmployees: builder.query({
            query: () => '/employees',
            providesTags: ['Employees'],
        }),
        createEmployee: builder.mutation({
            query: (data) => ({
                url: 'employees',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Employees'],
        }),
        updateEmployee: builder.mutation({
            query: ({ id, data }) => ({
                url: `employees/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Employees'],
        }),
        deleteEmployee: builder.mutation({
            query: (id) => ({
                url: `employees/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Employees'],
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
    }),
});

export const {
    useGetEmployeesQuery,
    useCreateEmployeeMutation,
    useUpdateEmployeeMutation,
    useDeleteEmployeeMutation,
    useVerifySignupMutation,
    useResendSignupOtpMutation,
} = employeeApi;

export default employeeApi; 