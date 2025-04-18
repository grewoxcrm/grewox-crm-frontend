import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const customFormApi = createApi({
    reducerPath: "customFormApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["CustomForms", "FormSubmissions"],
    endpoints: (builder) => ({
        getCustomForms: builder.query({
            query: () => ({
                url: "/custom-forms",
                method: "GET"
            }),
            transformResponse: (response) => ({
                data: response.data || [],
                success: response.success,
                message: response.message
            }),
            providesTags: ["CustomForms"],
        }),
        createCustomForm: builder.mutation({
            query: (data) => ({
                url: "/custom-forms",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["CustomForms"],
        }),
        updateCustomForm: builder.mutation({
            query: ({ id, data }) => ({
                url: `/custom-forms/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["CustomForms"],
        }),
        deleteCustomForm: builder.mutation({
            query: (id) => ({
                url: `/custom-forms/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["CustomForms"],
        }),
        getCustomFormById: builder.query({
            query: (id) => `/custom-forms/${id}`,
            transformResponse: (response) => ({
                data: response.data,
                success: response.success,
                message: response.message
            }),
            providesTags: (result, error, id) => [{ type: 'CustomForms', id }],
        }),
        // Form Submissions endpoints
        getFormSubmissions: builder.query({
            query: (formId) => ({
                url: `/form-submissions/${formId}/submissions`,
                method: 'GET'
            }),
            transformResponse: (response) => ({
                data: response.data || [],
                success: response.success,
                message: response.message
            }),
            providesTags: (result, error, formId) => [
                { type: 'FormSubmissions', id: formId },
                'FormSubmissions'
            ],
        }),
        getFormSubmissionById: builder.query({
            query: (id) => ({
                url: `/form-submissions/${id}`,
                method: 'GET'
            }),
            transformResponse: (response) => ({
                data: response.data,
                success: response.success,
                message: response.message
            }),
            providesTags: (result, error, id) => [{ type: 'FormSubmissions', id }],
        }),
        deleteFormSubmission: builder.mutation({
            query: (submissionId) => ({
                url: `/form-submissions/${submissionId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, submissionId) => [
                { type: 'FormSubmissions', id: submissionId },
                'FormSubmissions'
            ],
        }),
        updateFormSubmission: builder.mutation({
            query: ({ submissionId, data }) => ({
                url: `/form-submissions/${submissionId}`,
                method: 'PUT',
                body: {
                    submission_data: data
                },
            }),
            invalidatesTags: (result, error, { submissionId }) => [
                { type: 'FormSubmissions', id: submissionId },
                'FormSubmissions'
            ],
        }),
        submitFormResponse: builder.mutation({
            query: ({ formId, data }) => ({
                url: `/form-submissions/${formId}/submit`,
                method: 'POST',
                body: {
                    submission_data: data
                },
            }),
            invalidatesTags: (result, error, { formId }) => [
                { type: 'FormSubmissions', id: formId },
                'FormSubmissions'
            ],
        }),
    }),
});

export const {
    useGetCustomFormsQuery,
    useCreateCustomFormMutation,
    useUpdateCustomFormMutation,
    useDeleteCustomFormMutation,
    useGetCustomFormByIdQuery,
    useGetFormSubmissionsQuery,
    useGetFormSubmissionByIdQuery,
    useDeleteFormSubmissionMutation,
    useUpdateFormSubmissionMutation,
    useSubmitFormResponseMutation,
} = customFormApi;

// Sample data for testing
export const sampleCustomForm = {
    title: "Employee Registration Form",
    description: "Collect employee information for onboarding process",
    fields: {
        fullName: {
            type: "string",
            required: true
        },
        age: {
            type: "number",
            required: true
        },
        bio: {
            type: "text",
            required: false
        },
        isActive: {
            type: "boolean",
            required: true
        }
    }
};

// You can use this to test the form:
/*
const testData = {
    title: "Employee Registration Form",
    description: "Collect employee information for onboarding process",
    fields: [
        {
            name: "fullName",
            type: "string",
            required: true
        },
        {
            name: "age",
            type: "number",
            required: true
        },
        {
            name: "bio",
            type: "text",
            required: false
        },
        {
            name: "isActive",
            type: "boolean",
            required: true
        }
    ]
};
*/ 