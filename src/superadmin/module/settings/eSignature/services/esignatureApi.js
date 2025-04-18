import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const esignatureApi = createApi({
  reducerPath: 'esignatureApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Esignature'],
  endpoints: (builder) => ({
    getAllSignatures: builder.query({
      query: () => ({
        url: '/esignatures',
        method: 'GET'
      }),
      transformResponse: (response) => {
        // Ensure we always return an array
        if (!response) return [];
        if (response.data) return Array.isArray(response.data) ? response.data : [];
        return Array.isArray(response) ? response : [];
      },
      providesTags: ['Esignature']
    }),
    createSignature: builder.mutation({
      query: (data) => ({
        url: '/esignatures',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Esignature']
    }),
    updateSignature: builder.mutation({
      query: ({ id, data }) => ({
        url: `/esignatures/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Esignature']
    }),
    deleteSignature: builder.mutation({
      query: (id) => ({
        url: `/esignatures/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Esignature']
    })
  })
});

export const {
  useGetAllSignaturesQuery,
  useCreateSignatureMutation,
  useUpdateSignatureMutation,
  useDeleteSignatureMutation
} = esignatureApi;
