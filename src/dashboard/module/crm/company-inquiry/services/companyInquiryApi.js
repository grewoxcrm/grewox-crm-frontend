import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const companyInquiryApi = createApi({
    reducerPath: "companyInquiryApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["CompanyInquiries"],
    endpoints: (builder) => ({
        getCompanyInquiries: builder.query({
            query: () => ({
                url: "/company-inquiries",
                method: "GET"
            }),
            transformResponse: (response) => {
                // Ensure we return the data in the expected format
                return {
                    data: response.data || [],
                    success: response.success,
                    message: response.message
                };
            },
            providesTags: ["CompanyInquiries"],
        }),
        createCompanyInquiry: builder.mutation({
            query: (data) => ({
                url: "/company-inquiries",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["CompanyInquiries"],
        }),
        updateCompanyInquiry: builder.mutation({
            query: ({ id, data }) => ({
                url: `/company-inquiries/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["CompanyInquiries"],
        }),
        deleteCompanyInquiry: builder.mutation({
            query: (id) => {
                if (!id) {
                    throw new Error("ID is required for deletion");
                }
                return {
                    url: `/company-inquiries/${id}`,
                    method: "DELETE",
                };
            },
            invalidatesTags: ["CompanyInquiries"],
        }),
    }),
});

export const {
    useGetCompanyInquiriesQuery,
    useCreateCompanyInquiryMutation,
    useUpdateCompanyInquiryMutation,
    useDeleteCompanyInquiryMutation,
} = companyInquiryApi;