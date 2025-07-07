import { apiSlice } from './apiSlice';
const TYPE_VALUES_URL = 'https://xxxxxxxxx.vercel.app/api/products';

export const typeValuesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addProduct: builder.mutation({
      query: (object) => ({
        url: `${TYPE_VALUES_URL}/add-product`,
        method: 'POST',
        body: object.registro,
        headers: {
          Authorization: `Bearer ${object.token}`,
        },
      }),
    }),
    updateProduct: builder.mutation({
      query: (object) => {
        const apiUrl = `${TYPE_VALUES_URL}/update-product/${object.id}`;
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
    deleteProduct: builder.mutation({
      query: (object) => ({
        url: `${TYPE_VALUES_URL}/delete-product/${object.registro.id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${object.token}`,
        },
      }),
    }),
    getTypeValue: builder.query({
      query: (id, token) => ({
        url: `${TYPE_VALUES_URL}/get-products/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    getProductsByUserId: builder.query({
      query: (param) => {  //al parecer solo permite OBJETO de entrada!
        return {
          url: `${TYPE_VALUES_URL}/get-products/${param.data.idUsuario}`,
          headers: {
            Authorization: `Bearer ${param.token}`,
          },
        };
      },
    }),
    updateProductAmount: builder.mutation({
      query: (object) => {
        const apiUrl = `${TYPE_VALUES_URL}/update-product-amount/${object.registro.productId}`;
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
  }),
});
export const {
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetTypeValueQuery,
  useGetProductsByUserIdQuery,
  useUpdateProductAmountMutation,
} = typeValuesApiSlice;
