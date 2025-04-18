import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const revenueApi = createApi({
  reducerPath: "revenueApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Revenue"],
  endpoints: (builder) => ({
    getRevenue: builder.query({
      query: () => "/sales-revenue",
      providesTags: ["Revenue"],
    }),
    createRevenue: builder.mutation({
      query: (data) => ({
        url: "/sales-revenue",
        method: "POST",
        body: data,
        formData: true,
        prepareHeaders: (headers) => {
          headers.set("Accept", "application/json");
          return headers;
        },
      }),
      invalidatesTags: ["Revenue"],
    }),
    updateRevenue: builder.mutation({
      query: ({ id, data }) => ({
        url: `sales-revenue/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Revenue"],
    }),
    deleteRevenue: builder.mutation({
      query: (id) => ({
        url: `sales-revenue/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Revenue"],
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
  useGetRevenueQuery,
  useCreateRevenueMutation,
  useUpdateRevenueMutation,
  useDeleteRevenueMutation,
  useVerifyUserOtpMutation,
  useResendOtpMutation,
  useVerifySignupMutation,
  useResendSignupOtpMutation,
} = revenueApi;
