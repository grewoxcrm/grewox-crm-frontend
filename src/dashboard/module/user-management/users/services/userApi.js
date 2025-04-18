import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/auth",
      providesTags: ["Users"],
    }),
    createUser: builder.mutation({
      query: (data) => ({
        url: "auth/signup",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `auth/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `auth/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
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
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useVerifyUserOtpMutation,
  useResendOtpMutation,
  useVerifySignupMutation,
  useResendSignupOtpMutation,
} = userApi;
