import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../store/baseQuery';

export const forgotPasswordApi = createApi({
    reducerPath: 'forgotPasswordApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        sendResetEmail: builder.mutation({
            query: (data) => ({
                url: '/auth/forgot-password',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response) => {
                return {
                    success: true,
                    message: response.message || 'Reset instructions sent successfully'
                };
            },
            transformErrorResponse: (response) => {
                return {
                    success: false,
                    error: response.data?.message || 'Failed to send reset instructions'
                };
            }
        }),

        verifyOtp: builder.mutation({
            query: (data) => ({
                url: '/auth/verify-otp',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response) => {
                return {
                    success: true,
                    message: response.message || 'OTP verified successfully'
                };
            },
            transformErrorResponse: (response) => {
                return {
                    success: false,
                    error: response.data?.message || 'Failed to verify OTP'
                };
            }
        }),

        resetPassword: builder.mutation({
            query: (data) => ({
                url: '/auth/reset-password',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response) => {
                return {
                    success: true,
                    message: response.message || 'Password reset successfully'
                };
            },
            transformErrorResponse: (response) => {
                return {
                    success: false,
                    error: response.data?.message || 'Failed to reset password'
                };
            }
        })
    })
});

export const {
    useSendResetEmailMutation,
    useVerifyOtpMutation,
    useResetPasswordMutation
} = forgotPasswordApi;
