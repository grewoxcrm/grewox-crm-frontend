import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const announcementApi = createApi({
  reducerPath: "announcementApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Announcements"],
  endpoints: (builder) => ({
    getAllAnnouncements: builder.query({
      query: (params) => ({
        url: "/announcements",
        method: "GET",
        params: params,
      }),
      providesTags: ["Announcements"],
      transformResponse: (response) => {
        if (response.data) {
          return response.data.map(announcement => ({
            ...announcement,
            key: announcement.id
          }));
        }
        return [];
      },
    }),
    getAnnouncementById: builder.query({
      query: (id) => `announcements/${id}`,
      providesTags: ["Announcements"],
    }),
    createAnnouncement: builder.mutation({
      query: (data) => ({
        url: "/announcements",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Announcements"],
    }),
    updateAnnouncement: builder.mutation({
      query: ({ id, data }) => ({
        url: `announcements/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Announcements"],
    }),
    deleteAnnouncement: builder.mutation({
      query: (id) => ({
        url: `announcements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Announcements"],
    }),
  }),
});

export const {
  useGetAllAnnouncementsQuery,
  useGetAnnouncementByIdQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = announcementApi;

export default announcementApi;
