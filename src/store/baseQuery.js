import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = getState()?.auth?.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    // Handle 401 errors and token refresh if needed
    if (result.error && result.error.status === 401) {
        // Try to refresh token
        const refreshResult = await baseQuery(
            { url: '/auth/refresh-token', method: 'POST' },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            // Store the new token
            api.dispatch({ type: 'auth/setToken', payload: refreshResult.data.token });

            // Retry the original request
            result = await baseQuery(args, api, extraOptions);
        } else {
            // If refresh fails, logout user
            api.dispatch({ type: 'auth/logout' });
        }
    }

    return result;
};
