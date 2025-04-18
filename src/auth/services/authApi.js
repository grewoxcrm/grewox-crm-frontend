import { createApi } from '@reduxjs/toolkit/query/react';
import { loginSuccess, loginFailure, loginStart } from './authSlice';
import { baseQueryWithReauth } from '../../store/baseQuery';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: {
                    login: credentials.login,
                    // If it's admin login button click, use default password
                    password: credentials.isAdminLogin ? 'defaultPassword123' : credentials.password
                },
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                dispatch(loginStart());
                try {
                    const { data: response } = await queryFulfilled;
                    if (response.success) {
                        // Store token in localStorage
                        localStorage.setItem('token', response.data.token);
                        localStorage.setItem('user', JSON.stringify(response.data.user));

                        dispatch(loginSuccess({
                            user: response.data.user,
                            token: response.data.token,
                            message: response.message
                        }));
                    } else {
                        dispatch(loginFailure(response.message || 'Login failed'));
                    }
                } catch (error) {
                    dispatch(loginFailure(error.error?.message || 'Login failed'));
                }
            },
        }),
        adminLogin: builder.mutation({
            query: (credentials) => ({
                url: '/auth/admin-login',
                method: 'POST',
                body: {
                    email: credentials.email,
                    isClientPage: credentials.isClientPage
                },
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                dispatch(loginStart());
                try {
                    const { data: response } = await queryFulfilled;
                    if (response.success) {
                        // Store token in localStorage
                        localStorage.setItem('token', response.data.token);
                        localStorage.setItem('user', JSON.stringify(response.data.user));

                        // Update Redux store
                        dispatch(loginSuccess({
                            user: response.data.user,
                            token: response.data.token,
                            message: response.message
                        }));
                    } else {
                        dispatch(loginFailure(response.message || 'Login failed'));
                    }
                } catch (error) {
                    dispatch(loginFailure(error.error?.message || 'Login failed'));
                }
            },
        }),
        getRole: builder.query({
            query: (roleId) => `/roles/${roleId}`,
        }),
    }),
});

export const { useLoginMutation, useAdminLoginMutation, useGetRoleQuery } = authApi;