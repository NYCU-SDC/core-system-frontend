const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
	const res = await fetch(`${BASE_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers
		},
		credentials: "include"
	});

	if (!res.ok) {
		console.error(res.statusText);
		throw new Error(`API request failed with status ${res.status}`);
	}

	if (res.status === 204) {
		return {} as T;
	}

	return res.json();
}
