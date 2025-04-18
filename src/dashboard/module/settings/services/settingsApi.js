import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../../../config/config';

export const settingsApi = createApi({
    reducerPath: 'settingsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getAllCurrencies: builder.query({
            query: (params) => ({
                url: '/currencies',
                method: 'GET',
                params: {
                    page: params?.page,
                    limit: params?.limit
                }
            }),
            transformResponse: (response) => response.data,
        }),
        getAllCountries: builder.query({
            query: (params) => ({
                url: '/countries',
                method: 'GET',
                params: {
                    page: params?.page,
                    limit: params?.limit
                }
            }),
            transformResponse: (response) => response.data,
        }),
    }),
});

export const {
    useGetAllCurrenciesQuery,
    useGetAllCountriesQuery,
} = settingsApi;
