import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../../store/baseQuery";

export const dealInvoiceApi = createApi({
  reducerPath: "dealInvoiceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["DealInvoices"],
  endpoints: (builder) => ({
    getDealInvoices: builder.query({
        query: (id) => `/invoices/${id}`,
      providesTags: ["DealInvoices"],
    }),
    getInvoiceById: builder.query({
      query: (id) => `/invoices/single/${id}`,
      providesTags: ["DealInvoices"],
    }),
    createDealInvoice: builder.mutation({
      query: ({id, data}) => ({
        url: `invoices/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["DealInvoices"],
    }),
    updateDealInvoice: builder.mutation({
      query: ({ id, data }) => ({
        url: `invoices/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["DealInvoices"],
    }),
    deleteDealInvoice: builder.mutation({
      query: (id) => ({
        url: `invoices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DealInvoices"],
    }),
   
  }),
});

export const {
  useGetDealInvoicesQuery,
  useCreateDealInvoiceMutation,
  useUpdateDealInvoiceMutation,
  useDeleteDealInvoiceMutation,
  useGetInvoiceByIdQuery,
} = dealInvoiceApi;
