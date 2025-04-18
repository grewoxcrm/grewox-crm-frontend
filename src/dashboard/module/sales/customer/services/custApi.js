import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Customers"],
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: () => "/customers",
      providesTags: ["Customers"],
    }),
    createCustomer: builder.mutation({
      query: (data) => ({
        url: "customers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Customers"],
    }),
    updateCustomer: builder.mutation({
      query: ({ id, data }) => ({
        url: `customers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Customers"],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customers"],
    }),
    verifyUserOtp: builder.mutation({
      query: (data) => ({
        url: "auth/verify-otp",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
    resendOtp: builder.mutation({
      query: (userId) => ({
        url: `auth/resend-otp/${userId}`,
        method: "POST",
      }),
    }),
    verifySignup: builder.mutation({
      query: ({ otp, token }) => ({
        url: "auth/verify-signup",
        method: "POST",
        body: { otp },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ["Users"],
    }),
    resendSignupOtp: builder.mutation({
      query: ({ token }) => ({
        url: "auth/resend-signup-otp",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useVerifyUserOtpMutation,
  useResendOtpMutation,
  useVerifySignupMutation,
  useResendSignupOtpMutation,
} = customerApi;
