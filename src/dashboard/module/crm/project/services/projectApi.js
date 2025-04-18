import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const projectApi = createApi({
    reducerPath: 'projectApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Projects'],
    endpoints: (builder) => ({
        getAllProjects: builder.query({
            query: (params) => ({
                url: '/projects',
                method: 'GET',
                params: params,
            }),
            providesTags: ['Projects'],
        }),
        getProjectById: builder.query({
            query: (id) => `/projects/${id}`,
            providesTags: ['Projects'],
        }),
        createProject: builder.mutation({
            query: (data) => ({
                url: '/projects',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Projects'],
        }),
        updateProject: builder.mutation({
            query: ({ id, data }) => ({
                url: `/projects/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Projects'],
        }),
        deleteProject: builder.mutation({
            query: (id) => ({
                url: `/projects/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Projects'],
        }),
        addProjectMembers: builder.mutation({
            query: ({ id, data }) => ({
                url: `/projects/membersadd/${id}`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Projects'],
        }),
        deleteProjectMembers: builder.mutation({
            query: ({ id, data }) => ({
                url: `/projects/membersdelete/${id}`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Projects'],
        }),
        addProjectFiles: builder.mutation({
            query: ({ id, data }) => ({
                url: `/projects/files/${id}`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Projects'],
        }),
        getClientProjects: builder.query({
            query: (clientId) => `/projects/clients/${clientId}`,
            providesTags: ['Projects'],
        }),
    }),
});

export const {
    useGetAllProjectsQuery,
    useGetProjectByIdQuery,
    useCreateProjectMutation,
    useUpdateProjectMutation,
    useDeleteProjectMutation,
    useAddProjectMembersMutation,
    useDeleteProjectMembersMutation,
    useAddProjectFilesMutation,
    useGetClientProjectsQuery,
} = projectApi;

export default projectApi; 