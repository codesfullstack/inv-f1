import { apiSlice } from './apiSlice';
const INVOICES_URL = 'https://xxxxxxxxx.app/api/invoices';

export const invoicesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addInvoice: builder.mutation({
      query: (object) => ({
        url: `${INVOICES_URL}/add-invoice`,
        method: 'POST',
        body: object.registro,
        headers: {
          Authorization: `Bearer ${object.token}`,
        },
      }),
    }),
    updateInvoice: builder.mutation({
      query: (object) => ({
        url: `${INVOICES_URL}/update-invoice/${object.id}`,
        method: 'PUT',
        body: object.registro,
        headers: {
          Authorization: `Bearer ${object.token}`,
        },
      }),
    }),
    deleteInvoice: builder.mutation({
      query: (object) => ({
        url: `${INVOICES_URL}/delete-invoice/${object.registro.id}`,   //
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${object.token}`,
        },
      }),
    }),
    getInvoice: builder.query({
      query: (id, token) => ({
        url: `${INVOICES_URL}/get-invoices/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    getInvoicesByUserId: builder.query({
      query: (param) => {  //al parecer solo permite OBJETO de entrada!
        return {
          url: `${INVOICES_URL}/get-invoices/${param.data.idUsuario}`,
          headers: {
            Authorization: `Bearer ${param.token}`,
          },
        };
      },
    }),
    getGenerateIdInvoice: builder.query({
      query: (object) => ({
        url: `${INVOICES_URL}/generate-id/${object.data.invoiceId}`,
        headers: {
          Authorization: `Bearer ${object.token}`,
        },
      }),
    }),
  }),
});
export const {
  useAddInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useGetInvoiceQuery,
  useGetInvoicesByUserIdQuery,
  useGetGenerateIdInvoiceQuery,
} = invoicesApiSlice;
