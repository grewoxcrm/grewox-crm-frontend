import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const creditNoteApi = createApi({
  reducerPath: "creditNoteApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["CreditNotes"],
  endpoints: (builder) => ({
    getCreditNotes: builder.query({
      query: () => "/sales-creditnote",
      providesTags: ["CreditNotes"],
    }),
    createCreditNote: builder.mutation({
      query: (data) => ({
        url: "sales-creditnote",
        method: "POST",
        body: data,
        formData: true,
      }),
      
      invalidatesTags: ["CreditNotes"],
    }),
    updateCreditNote: builder.mutation({
      query: ({ id, data }) => ({
        url: `sales-creditnote/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CreditNotes"],
    }),
    deleteCreditNote: builder.mutation({
      query: (id) => ({
        url: `sales-creditnote/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CreditNotes"],
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
  useGetCreditNotesQuery,
  useCreateCreditNoteMutation,
  useUpdateCreditNoteMutation,
  useDeleteCreditNoteMutation,
  useVerifyUserOtpMutation,
  useResendOtpMutation,
  useVerifySignupMutation,
  useResendSignupOtpMutation,
} = creditNoteApi;
