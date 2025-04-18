import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";
import { emailTemplates } from "../templates/emailTemplates";

export const mailApi = createApi({
  reducerPath: "mailApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Mail", "EmailSettings"],
  endpoints: (builder) => ({

    getEmails: builder.query({
      query: (type) => type ? `/mail/?type=${type}` : '/mail',
      providesTags: ["Mail"],
      transformResponse: (response) => {
        // Sort emails by date
        const emails = response.data || [];
        return {
          ...response,
          data: emails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        };
      }
    }),


    sendEmail: builder.mutation({
      query: (formData) => {
        console.log('Sending email with attachments:', formData.getAll('attachments').length);
        return {
          url: "/mail",
          method: "POST",
          body: formData,
          formData: true,
          // Don't set Content-Type - browser will set it with boundary
        };
      },
      invalidatesTags: ["Mail"],
    }),


    starEmail: builder.mutation({
      query: ({ id }) => ({
        url: `/mail/star/${id}`,
        method: "PUT"
      }),
      invalidatesTags: ["Mail"],
    }),


    toggleImportant: builder.mutation({
      query: ({ id }) => ({
        url: `/mail/important/${id}`,
        method: "PUT"
      }),
      invalidatesTags: ["Mail"],
    }),


    deleteEmail: builder.mutation({
      query: ({ id }) => ({
        url: `/mail/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Mail"],
    }),


    moveToTrash: builder.mutation({
      query: ({ id }) => ({
        url: `/mail/trash/${id}`,
        method: "PUT"
      }),
      invalidatesTags: ["Mail"],
    }),


    getEmailSettings: builder.query({
      query: () => '/mail/settings',
      providesTags: ['EmailSettings'],
    }),


    createEmailSettings: builder.mutation({
      query: (data) => ({ 
        url: '/mail/settings',
        method: 'POST',
        body: data, 
      }),
      invalidatesTags: ['EmailSettings'],
    }),


    updateEmailSettings: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/mail/settings/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['EmailSettings'],
    }),
  }),
});

export const {
  useGetEmailsQuery,
  useSendEmailMutation,
  useStarEmailMutation,
  useToggleImportantMutation,
  useDeleteEmailMutation,
  useMoveToTrashMutation,
  useGetEmailSettingsQuery,
  useCreateEmailSettingsMutation,
  useUpdateEmailSettingsMutation,
} = mailApi;