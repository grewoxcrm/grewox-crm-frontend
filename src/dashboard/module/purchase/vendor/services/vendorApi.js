import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const vendorApi = createApi({
    reducerPath: "vendorApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Vendors"],
    endpoints: (builder) => ({
        getVendors: builder.query({
            query: () => "/vendors",
            providesTags: ["Vendors"],
        }),
        createVendor: builder.mutation({
            query: (data) => ({
                url: "vendors",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Vendors"],
        }),
        updateVendor: builder.mutation({
            query: ({ id, data }) => ({
                url: `vendors/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Vendors"],
        }),
        deleteVendor: builder.mutation({
            query: (id) => ({
                url: `vendors/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Vendors"],
        }),
       
    }),
});

export const {
    useGetVendorsQuery,
    useCreateVendorMutation,
    useUpdateVendorMutation,
    useDeleteVendorMutation,
    useGetVendorByIdQuery,
} = vendorApi;