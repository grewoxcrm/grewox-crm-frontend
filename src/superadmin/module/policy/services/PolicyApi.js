import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../store/baseQuery";

export const companyApi = createApi({
  reducerPath: "companyApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Companies"],
  endpoints: (builder) => ({
    getAllCompanies: builder.query({
      query: () => ({
        url: "/clients",
        method: "GET",
      }),
      providesTags: ["Companies"],
    }),
    createCompany: builder.mutation({
      query: (data) => ({
        url: "/clients",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Companies"],
    }),
    updateCompany: builder.mutation({
      query: ({ id, data }) => ({
        url: `/clients/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Companies"],
    }),
    deleteCompany: builder.mutation({
      query: (id) => ({
        url: `/clients/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Companies"],
    }),
  }),
});

export const {
  useGetAllCompaniesQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} = companyApi;
