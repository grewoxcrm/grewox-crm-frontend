import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const taskApi = createApi({
  reducerPath: "taskApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Tasks"],
  endpoints: (builder) => ({
    getAllTasks: builder.query({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        console.log('Raw API Response:', JSON.stringify(response, null, 2));
        if (response?.data) {
          const transformedData = {
            ...response,
            data: response.data.map(task => {
              console.log('Processing task:', task);
              if (!task.taskName) {
                console.warn('Task with missing taskName:', task);
              }
              return {
                ...task,
                taskName: task.taskName || task.task_name || 'Untitled Task'
              };
            })
          };
          console.log('Transformed Response:', JSON.stringify(transformedData, null, 2));
          return transformedData;
        }
        return response;
      },
      providesTags: ["Tasks"],
    }),
    createTask: builder.mutation({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tasks"],
    }),


    updateTask: builder.mutation({
      query: ({ id, data }) => {
        console.log("Update Task Request Data:", JSON.stringify(data, null, 2));
        return {
          url: `/tasks/${id}`,
          method: "PUT",
          body: data,
        };
      },
      transformResponse: (response) => {
        console.log('Update Task Response:', JSON.stringify(response, null, 2));
        if (!response?.taskName) {
          console.warn('Update response missing taskName:', response);
        }
        return response;
      },
      invalidatesTags: ["Tasks"],
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"],
    }),
  }),
});

export const {
  useGetAllTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApi;

export default taskApi;
