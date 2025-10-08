const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class UnauthorizedError extends Error {
	constructor(public detail: string) {
		super(detail);
		this.name = 'UnauthorizedError';
	}
}

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
		// Check if it's a 401 Unauthorized error
		if (res.status === 401) {
			try {
				const errorData = await res.json();
				console.error('Unauthorized:', errorData);
				throw new UnauthorizedError(errorData.detail || 'Unauthorized');
			} catch (e) {
				if (e instanceof UnauthorizedError) throw e;
				throw new UnauthorizedError('Unauthorized - missing access token');
			}
		}
		
		console.error(res.statusText);
		throw new Error(`API request failed with status ${res.status}`);
	}

	return res.json();
}
