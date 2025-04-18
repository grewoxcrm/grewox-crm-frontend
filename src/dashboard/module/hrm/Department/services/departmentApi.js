import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const departmentApi = createApi({
    reducerPath: 'departmentApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Departments', 'DepartmentTypes'],
    endpoints: (builder) => ({
        // Get all departments
        getAllDepartments: builder.query({
            query: () => ({
                url: '/departments',
                method: 'GET',
            }),
            transformResponse: (response) => {
                if (response?.success) {
                    return response.data;
                }
                throw new Error(response?.message || 'Failed to fetch departments');
            },
            providesTags: ['Departments'],
        }),

        // Create department
        createDepartment: builder.mutation({
            query: (data) => ({
                url: '/departments',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response) => {
                if (response?.success) {
                    return response.data;
                }
                throw new Error(response?.message || 'Failed to create department');
            },
            invalidatesTags: ['Departments'],
        }),

        // Update department
        updateDepartment: builder.mutation({
            query: ({ id, data }) => ({
                url: `/departments/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response) => {
                if (response?.success) {
                    return response.data;
                }
                throw new Error(response?.message || 'Failed to update department');
            },
            invalidatesTags: ['Departments'],
        }),

        // Delete department
        deleteDepartment: builder.mutation({
            query: (id) => ({
                url: `/departments/${id}`,
                method: 'DELETE',
            }),
            transformResponse: (response) => {
                if (response?.success) {
                    return response.data;
                }
                throw new Error(response?.message || 'Failed to delete department');
            },
            invalidatesTags: ['Departments'],
        }),

        // Get all department types
        getDepartmentTypes: builder.query({
            query: () => ({
                url: '/department-types',
                method: 'GET',
            }),
            transformResponse: (response) => {
                if (response?.success) {
                    return response.data;
                }
                throw new Error(response?.message || 'Failed to fetch department types');
            },
            providesTags: ['DepartmentTypes'],
        }),

        // Create department type
        createDepartmentType: builder.mutation({
            query: (data) => ({
                url: '/department-types',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response) => {
                if (response?.success) {
                    return response.data;
                }
                throw new Error(response?.message || 'Failed to create department type');
            },
            invalidatesTags: ['DepartmentTypes'],
        }),

        // Update department type
        updateDepartmentType: builder.mutation({
            query: ({ id, data }) => ({
                url: `/department-types/${id}`,
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response) => {
                if (response?.success) {
                    return response.data;
                }
                throw new Error(response?.message || 'Failed to update department type');
            },
            invalidatesTags: ['DepartmentTypes'],
        }),

        // Delete department type
        deleteDepartmentType: builder.mutation({
            query: (id) => ({
                url: `/department-types/${id}`,
                method: 'DELETE',
            }),
            transformResponse: (response) => {
                if (response?.success) {
                    return response.data;
                }
                throw new Error(response?.message || 'Failed to delete department type');
            },
            invalidatesTags: ['DepartmentTypes'],
        }),
    }),
});

export const {
    useGetAllDepartmentsQuery,
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useDeleteDepartmentMutation,
    useGetDepartmentTypesQuery,
    useCreateDepartmentTypeMutation,
    useUpdateDepartmentTypeMutation,
    useDeleteDepartmentTypeMutation,
} = departmentApi;
export default departmentApi;

