import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: ["Products"],
    }),
    createProduct: builder.mutation({
      query: ({ id, data }) => {
        const formData = data;
        return {
          url: `/products/${id}`,
          method: "POST",
          body: formData,
          formData: true,
          prepareHeaders: (headers) => {
            headers.set("Accept", "application/json");
            return headers;
          },
        };
      },
      invalidatesTags: ["Products"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, data }) => {
        const formData = data;
        return {
          url: `/products/${id}`,
          method: "PUT",
          body: formData,
          formData: true,
          prepareHeaders: (headers) => {
            headers.set("Accept", "application/json");
            return headers;
          },
        };
      },
      invalidatesTags: ["Products"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
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
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useVerifyUserOtpMutation,
  useResendOtpMutation,
  useVerifySignupMutation,
  useResendSignupOtpMutation,
} = productApi;
