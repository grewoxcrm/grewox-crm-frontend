import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const salaryApi = createApi({
  reducerPath: "salaryApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Salary"],
  endpoints: (builder) => ({
    getSalary: builder.query({
      query: () => "/salary",
      providesTags: ["Salary"],
    }),
    createSalary: builder.mutation({
      query: (data) => ({
        url: "salary",
        method: "POST",
        body: data,
        formData: true,
      }),
      invalidatesTags: ["Salary"],
    }),
    updateSalary: builder.mutation({
      query: ({ id, data }) => ({
        url: `salary/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Salary"],
    }),
    deleteSalary: builder.mutation({
      query: (id) => ({
        url: `salary/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Salary"],
    }),
  }),
});

export const {
  useGetSalaryQuery,
  useCreateSalaryMutation,
  useUpdateSalaryMutation,
  useDeleteSalaryMutation,
} = salaryApi;
