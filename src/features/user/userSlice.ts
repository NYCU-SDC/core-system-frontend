import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import type {User} from "@/types/user.ts";

export const STATUS = {
    Unauthenticated: "unauthenticated",
    Authenticating: "authenticating",
    Authenticated: "authenticated",
    Error: "error",
} as const;

export type Status = typeof STATUS[keyof typeof STATUS];

export interface UserState {
    status: Status;
    user: User | null;
}

const initialState: UserState = {
    status: STATUS.Unauthenticated,
    user: null,
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
            state.status = action.payload ? STATUS.Authenticated : STATUS.Unauthenticated;
        },
        setStatus: (state, action: PayloadAction<Status>) => {
            state.status = action.payload;
        },
    },
});


