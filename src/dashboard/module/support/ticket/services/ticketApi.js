import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const ticketApi = createApi({
    reducerPath: 'ticketApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Tickets'],
    endpoints: (builder) => ({
        getAllTickets: builder.query({
            query: (params) => ({
                url: 'tickets',
                method: 'GET',
                params: params,
            }),
            providesTags: ['Tickets'],
        }),

        createTicket: builder.mutation({
            query: (data) => ({
                url: 'tickets',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Tickets'],
        }),

        updateTicket: builder.mutation({
            query: ({ id, data }) => ({
                url: `tickets/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Tickets'],
        }),

        deleteTicket: builder.mutation({
            query: (id) => ({
                url: `tickets/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Tickets'],
        }),
    }),
});

export const {
    useGetAllTicketsQuery,
    useCreateTicketMutation,
    useUpdateTicketMutation,
    useDeleteTicketMutation,
} = ticketApi;

export default ticketApi;
