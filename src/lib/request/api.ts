const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
	if (!options.headers["Content-Type"])
		options.headers["Content-Type"] = "application/json";

	const res = await fetch(`${BASE_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		}
	});

	if (!res.ok) {
		console.error(res.statusText);
		throw new Error(`API request failed with status ${res.status}`);
	}

	return res.json();
}
