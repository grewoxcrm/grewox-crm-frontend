import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const roleApi = createApi({
    reducerPath: 'roleApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Roles'],
    endpoints: (builder) => ({
        getRoles: builder.query({
            query: () => ({
                url: '/roles',
                method: 'GET'
            }),
            transformResponse: (response) => {
                const roles = Array.isArray(response) ? response : response?.data || [];
                return {
                    data: roles,
                    total: roles.length,
                    success: true
                };
            },
            transformErrorResponse: (response) => ({
                data: [],
                total: 0,
                success: false,
                error: response.data?.message || 'Failed to fetch roles'
            }),
            providesTags: ['Roles']
        }),

       
        getRole: builder.query({
            query: (id) => ({
                url: `/roles/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'Roles', id }]
        }),

        createRole: builder.mutation({
            query: (data) => ({
                url: '/roles',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['Roles']
        }),

        updateRole: builder.mutation({
            query: ({ id, data }) => ({
                url: `/roles/${id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Roles', id },
                'Roles'
            ]
        }),

        deleteRole: builder.mutation({
            query: (id) => ({
                url: `/roles/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Roles']
        })
    })
});

export const {
    useGetRolesQuery,

    useGetRoleQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation
} = roleApi; 