﻿import { apiSlice } from './apiSlice';
const TYPE_VALUES_URL = 'https://xxxxxxxxx.vercel.app/api/products-invoices';

export const typeValuesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addProductInvoice: builder.mutation({
      query: (object) => ({
        url: `${TYPE_VALUES_URL}/add-product-invoice`,
        method: 'POST',
        body: object.registro,
        headers: {
          Authorization: `Bearer ${object.token}`,
        },
      }),
    }),
    updateProductInvoice: builder.mutation({
      query: (object) => {
        const apiUrl = `${TYPE_VALUES_URL}/update-product-invoice/${object.id}`;
        console.log("update object:", object);
        return {
          url: apiUrl,
          method: 'PUT',
          body: object.registro,
          headers: {
            Authorization: `Bearer ${object.token}`,
          },
        };
      },
    }),
    deleteProductInvoice: builder.mutation({
      query: (object) => ({
        url: `${TYPE_VALUES_URL}/delete-product-invoices/${object.registro.id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${object.token}`,
        },
      }),
    }),
    getProductInvoice: builder.query({
      query: (id, token) => ({
        url: `${TYPE_VALUES_URL}/get-products-invoice/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    getProductsByUserIdInvoice: builder.query({
      query: (param) => {  //al parecer solo permite OBJETO de entrada!
        return {
          url: `${TYPE_VALUES_URL}/get-products-invoice/${param.data.idUsuario}`,
          headers: {
            Authorization: `Bearer ${param.token}`,
          },
        };
      },
    }),
    deleteProductsByInvoiceID: builder.mutation({
      query: (object) => ({
        url: `${TYPE_VALUES_URL}/delete-products-invoice-id/${object.registro.invoiceID}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${object.token}`,
        },
      }),
    }),
  }),
});
export const {
  useAddProductInvoiceMutation,
  useUpdateProductInvoiceMutation,
  useDeleteProductInvoiceMutation,
  useGetProductInvoiceQuery,
  useGetProductsByUserIdInvoiceQuery,
  useDeleteProductsByInvoiceIDMutation,
} = typeValuesApiSlice;
