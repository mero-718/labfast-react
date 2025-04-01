import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Define types for our data
export interface DataItem {
  id: number;
  title: string;
  description: string;
}

export interface AuthResponse {
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  enrollNumber: string;
  dateOfAdmission: string;
  avatar: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

// Create the API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BACKEND_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
    validateStatus: (response) => {
      return response.status >= 200 && response.status < 300;
    },
  }),
  tagTypes: ['Data', 'Users'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      }),
      transformErrorResponse: (response) => {
        if (response.status === 401) {
          return {
            status: 401,
            data: 'Invalid username or password',
          };
        }
        return response;
      },
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: 'users',
        method: 'POST',
        body: userData,
      }),
    }),

    // User endpoints
    getUsers: builder.query<User[], void>({
      query: () => 'users',
      providesTags: ['Users'],
    }),

    getUser: builder.query<User, number>({
      query: (id) => `users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),

    updateUser: builder.mutation<User, Partial<User> & { id: number }>({
      query: ({ id, ...user }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: user,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Users', id }],
    }),

    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = apiSlice; 