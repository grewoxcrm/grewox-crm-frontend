import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const trainingApi = createApi({
    reducerPath: 'trainingApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Trainings', 'BranchTypes'],
    endpoints: (builder) => ({
        getAllTrainings: builder.query({
            query: (params) => ({
                url: '/trainings',
                method: 'GET',
                params: params,
            }),
            providesTags: ['Trainings'],
        }),
        getTrainingById: builder.query({
            query: (id) => `/trainings/${id}`,
            providesTags: ['Trainings'],
        }),
        createTraining: builder.mutation({
            query: (data) => ({
                url: '/trainings',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Trainings'],
        }),
        updateTraining: builder.mutation({
            query: ({ id, data }) => ({
                url: `/trainings/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Trainings'],
        }),
        deleteTraining: builder.mutation({
            query: (id) => ({
                url: `/trainings/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Trainings'],
        }),
       
    }),
});

export const {
    useGetAllTrainingsQuery,
    useGetTrainingByIdQuery,
    useCreateTrainingMutation,
    useUpdateTrainingMutation,
    useDeleteTrainingMutation,
} = trainingApi;
export default trainingApi;

