const getErrorDetail = (payload: unknown): string | null => {
	if (typeof payload === "string" && payload.trim()) return payload;
	if (!payload || typeof payload !== "object") return null;

	const record = payload as Record<string, unknown>;
	if (typeof record.detail === "string" && record.detail) return record.detail;
	if (typeof record.message === "string" && record.message) return record.message;
	if (typeof record.title === "string" && record.title) return record.title;

	return null;
};

export const formatApiErrorMessage = (message: string, status: number, payload?: unknown): string => {
	const detail = getErrorDetail(payload);
	return detail ? `${message}: ${detail}` : `${message} (status ${status})`;
};

export const assertOk = (status: number, message: string, payload?: unknown) => {
	if (status < 200 || status >= 300) {
		throw new Error(formatApiErrorMessage(message, status, payload));
	}
};
