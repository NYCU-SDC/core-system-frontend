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

export function buildMeta(options: BuildMetaOptions): BuildMetaResult;
