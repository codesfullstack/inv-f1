import { apiSlice } from './apiSlice';
const REGISTER_URL = 'https://xxxxxxxxx.vercel.app/api/registers';

export const registerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addRegister: builder.mutation({
      query: (object) => ({
        url: `${REGISTER_URL}/add-register`,
        method: 'POST',
        body: object.registro, // Asume que userData es el objeto del nuevo usuario
        headers: {
          Authorization: `Bearer ${object.token}`,
        },
      }),
    }),
    updateRegister: builder.mutation({
      query: (object) => ({
        url: `${REGISTER_URL}/update-register/${object.id}`,
        method: 'PUT',
        body: object.registro, // Asume que updatedUserData es el objeto con los datos actualizados
        headers: {
          Authorization: `Bearer ${object.token}`,
        },
      }),
    }),
    deleteRegister: builder.mutation({
      query: (object) => ({
        url: `${REGISTER_URL}/delete-register/${object.registro.id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${object.token}`,
        },
      }),
    }),
    getRegisterById: builder.query({
      query: (id, token) => ({
        url: `${REGISTER_URL}/get-register/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
    getRegistersByCriteria: builder.query({
      query: (object) => ({
        url: `${REGISTER_URL}/get-registers/${object.data.idUsuario}`,
        headers: {
          Authorization: `Bearer ${object.token}`,
        },
      }),
    }),
  }),
});
export const {
  useAddRegisterMutation, // En lugar de useAddUserMutation
  useUpdateRegisterMutation, // En lugar de useUpdateUserMutation
  useDeleteRegisterMutation, // En lugar de useDeleteUserMutation
  useGetRegisterByIdQuery, // En lugar de useGetUserByIdQuery
  useGetRegistersByCriteriaQuery, // En lugar de useGetUsersByCriteriaQuery
} = registerApiSlice;
