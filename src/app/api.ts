import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

export const baseQuery = fetchBaseQuery({
	baseUrl: import.meta.env.VITE_API_BASE_URL,
	credentials: "include",
	prepareHeaders: (headers, { endpoint }) => {
		console.log('API Request to:', endpoint);
		console.log('Full URL will be:', import.meta.env.VITE_API_BASE_URL + '/' + endpoint);

		// 添加必要的 headers
		headers.set('Accept', 'application/json');
		headers.set('Content-Type', 'application/json');

		return headers;
	},
});
