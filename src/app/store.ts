import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/example/counterSlice";
import { authApi } from "@/features/auth/authApi";
import { formsApi } from "@/features/forms/api/formApi.ts";

export const store = configureStore({
	reducer: {
		counter: counterReducer,
		[authApi.reducerPath]: authApi.reducer,
		[formsApi.reducerPath]: formsApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(
			authApi.middleware,
			formsApi.middleware
		),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
