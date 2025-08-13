export interface ApiOptions {
    method?: string
    headers?: Record<string, string>
    body?: any
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
    try {
        const response = await fetch(`${path}`, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            ...(options.body ? { body: JSON.stringify(options.body) } : {})
        })
        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`API error: ${response.status} ${errorText}`)
        }
        return await response.json()
    } catch (err) {
        throw err
    }
}