import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";

export const billingApi = createApi({
    reducerPath: "billingApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Billings", "Vendor"],
    endpoints: (builder) => ({
        // Get all bills for a company
        getBillings: builder.query({
            query: (id) => `/bills/${id}`,
            providesTags: ["Billings"],
        }),

        // Create new bill
        createBilling: builder.mutation({
            query: ({id, data}) => ({
                url: `/bills/${id}`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Billings"],
        }),

        // Get single bill by ID
        getBillById: builder.query({
            query: (id) => ({
                url: `/bills/${id}`,
                method: "GET"
            }),
            providesTags: ["Billings"],
        }),

        // Update bill
        updateBilling: builder.mutation({
            query: ({ id, data }) => ({
                url: `/bills/${id}`,
                method: "PUT",
                body: data
            }),
            invalidatesTags: ["Billings"],
        }),

        // Delete bill
        deleteBilling: builder.mutation({
            query: (id) => ({
                url: `/bills/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: ["Billings"],
        }),

        // Download bill
        downloadBill: builder.query({
            query: (id) => ({
                url: `/bills/download/${id}`,
                method: "GET"
            }),
        }),

        // Add this new endpoint for vendors
        getVendors: builder.query({
            query: () => ({
                url: '/vendors',
                method: 'GET'
            }),
            providesTags: ['Vendor']
        }),

        // Add this new endpoint for products
        // getProducts: builder.query({
        //     query: () => ({
        //         url: '/products',
        //         method: 'GET'
        //     }),
        //     providesTags: ['Products']
        // }),
    }),
});

export const {
    useGetBillingsQuery,
    useCreateBillingMutation,
    useUpdateBillingMutation,
    useDeleteBillingMutation,
    useGetBillByIdQuery,
    useDownloadBillQuery,
    useGetVendorsQuery,
    // useGetProductsQuery,
} = billingApi;