import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { User } from "@/types/user"

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api",
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getMe: builder.query<User, void>({
            query: () => "/user/me",
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: "/logout",
                method: "POST",
            }),
        }),
    }),
})

export const { useGetMeQuery, useLogoutMutation } = authApi
