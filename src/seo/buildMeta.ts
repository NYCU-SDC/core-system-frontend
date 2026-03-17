export const SITE_NAME = "Core System";

export interface BuildMetaOptions {
	title: string;
	description?: string;
	noIndex?: boolean;
	canonicalUrl?: string;
	siteName: string;
}

export interface BuildMetaResult {
	fullTitle: string;
	description?: string;
	noIndex?: boolean;
	canonicalUrl?: string;
}

export function buildMeta({ title, description, noIndex, canonicalUrl, siteName }: BuildMetaOptions): BuildMetaResult {
	const fullTitle = title === siteName ? title : `${title} - ${siteName}`;

	return {
		fullTitle,
		description,
		noIndex,
		canonicalUrl
	};
}
