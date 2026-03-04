export const NormalizeDateToUtc = (dateInput: string, endOfDay = false) => {
	if (!dateInput) return undefined;
	const suffix = endOfDay ? "T23:59:59Z" : "T00:00:00Z";
	return `${dateInput}${suffix}`;
};
