import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../../../store/baseQuery";

export const activityApi = createApi({
  reducerPath: "activityApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Activity"],
  endpoints: (builder) => ({
    getActivities: builder.query({
      query: (id) => ({
        url: `/activities/${id}`,
        method: "GET"
      }),
      providesTags: ["Activity"]
    })
  })
});

export const {
  useGetActivitiesQuery
} = activityApi;
