import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../../store/baseQuery";

export const dealPaymentApi = createApi({
  reducerPath: "dealPaymentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["DealPayments"],
  endpoints: (builder) => ({
    getDealPayments: builder.query({
      query: (id) => `/payments/${id}`,
      providesTags: ["DealPayments"],
    }),
    createDealPayment: builder.mutation({
      query: ({id, data}) => ({
        url: `payments/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["DealPayments"],
    }),
    updateDealPayment: builder.mutation({
      query: ({ id, data }) => ({
        url: `payments/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["DealPayments"],
    }),
    deleteDealPayment: builder.mutation({
      query: (id) => ({
        url: `payments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DealPayments"],
    }),
   
  }),
});

export const {
  useGetDealPaymentsQuery,
  useCreateDealPaymentMutation,
  useUpdateDealPaymentMutation,
  useDeleteDealPaymentMutation,
} = dealPaymentApi;
