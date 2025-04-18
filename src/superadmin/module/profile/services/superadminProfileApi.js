import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../store/baseQuery';

export const superadminProfileApi = createApi({
    reducerPath: 'superadminProfileApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['SuperAdminProfile'],
    endpoints: (builder) => ({
        updateSuperAdminProfile: builder.mutation({
            query: ({ id, formData }) => {
                return {
                    url: `/super-admin/${id}?skipDelete=true`,
                    method: 'PUT',
                    body: formData,
                    formData: true,
                };
            },
            invalidatesTags: ['SuperAdminProfile'],
        }),
        getSuperAdminProfile: builder.query({
            query: (id) => `/super-admin/${id}`,
            providesTags: ['SuperAdminProfile'],
        }),
    }),
});

export const {
    useUpdateSuperAdminProfileMutation,
    useGetSuperAdminProfileQuery,
} = superadminProfileApi;
