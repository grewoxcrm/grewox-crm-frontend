import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const companyAccountApi = createApi({
  reducerPath: "companyAccountApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["CompanyAccounts"],
  endpoints: (builder) => ({
    getCompanyAccounts: builder.query({
      query: () => "/company-accounts",
      providesTags: ["CompanyAccounts"],
    }),
    createCompanyAccount: builder.mutation({
      query: (data) => ({
        url: "company-accounts",
        method: "POST", 
        body: data,
      }),
      invalidatesTags: ["CompanyAccounts"],
    }),
    updateCompanyAccount: builder.mutation({
      query: ({ id, data }) => ({
        url: `company-accounts/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CompanyAccounts"],
    }),
    deleteCompanyAccount: builder.mutation({
      query: (id) => ({
        url: `company-accounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CompanyAccounts"],
    }),
  }),
});

export const {
  useGetCompanyAccountsQuery,
  useCreateCompanyAccountMutation,
  useUpdateCompanyAccountMutation,
  useDeleteCompanyAccountMutation,
} = companyAccountApi;
