const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
	// if (!options.headers["Content-Type"])
	// 	options.headers["Content-Type"] = "application/json";

	console.log(`API Request: ${BASE_URL}${path}`, options);


	const res = await fetch(`${BASE_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
		"credentials": "include", 
	})

	console.log(`API Response get`);

	if (!res.ok) {
		console.error(res.statusText);
		throw new Error(`API request failed with status ${res.status}`);
	}

	return res.json();
}
