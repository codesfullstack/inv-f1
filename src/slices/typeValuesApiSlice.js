import { apiSlice } from './apiSlice';
const TYPE_VALUES_URL = 'https://xxxxxxxxx.vercel.app/api/type-value';

export const typeValuesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addTypeValue: builder.mutation({
      query: (object) => ({
        url: `${TYPE_VALUES_URL}/add-type-value`,
        method: 'POST',
        body: object.registro,
        headers: {
          Authorization: `Bearer ${object.token}`,
        },
      }),
    }),
    updateTypeValue: builder.mutation({
      query: (object) => ({
        url: `${TYPE_VALUES_URL}/update-type-value/${object.data.id}`,
        method: 'PUT',
        body: object.data.registro,
        headers: {
          Authorization: `Bearer ${object.data.token}`,
        },
      }),
    }),
    deleteTypeValue: builder.mutation({
      query: (object) => ({
        url: `${TYPE_VALUES_URL}/delete-type-value/${object.data.id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${object.data.token}`,
        },
      }),
    }),
    getTypeValue: builder.query({
      query: (id, token) => ({
        url: `${TYPE_VALUES_URL}/get-type-value/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    getTypeValuesByUserId: builder.query({
      query: (param) => {  //al parecer solo permite OBJETO de entrada!
        console.log("type value:", param); // Agregar un console.log aquÃ­
        return {
          url: `${TYPE_VALUES_URL}/get-type-values/${param.idUsuario}`,
          headers: {
            Authorization: `Bearer ${param.token}`,
          },
        };
      },
    }),
  }),
});
export const {
  useAddTypeValueMutation,
  useUpdateTypeValueMutation,
  useDeleteTypeValueMutation,
  useGetTypeValueQuery,
  useGetTypeValuesByUserIdQuery,
} = typeValuesApiSlice;
