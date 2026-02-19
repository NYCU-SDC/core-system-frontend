export function buildMeta({ title, description, noIndex, canonicalUrl, siteName }) {
	const fullTitle = title === siteName ? title : `${title} - ${siteName}`;

	return {
		fullTitle,
		description,
		noIndex,
		canonicalUrl
	};
}
