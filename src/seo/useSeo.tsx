import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { buildMeta } from "./buildMeta";
import type { SeoRule, SeoRuleContext } from "./seo.config";

const SITE_NAME = "Core System";

interface UseSeoOptions {
	rule: SeoRule;
	params?: Record<string, string>;
	data?: SeoRuleContext["data"];
}

export function useSeo({ rule, params = {}, data }: UseSeoOptions) {
	const location = useLocation();
	const context: SeoRuleContext = { params, data };

	const resolve = <T,>(value: T | ((ctx: SeoRuleContext) => T)): T => (typeof value === "function" ? (value as (ctx: SeoRuleContext) => T)(context) : value);

	const title = resolve(rule.title);
	const description = rule.description ? resolve(rule.description) : undefined;

	const url = typeof window !== "undefined" ? `${window.location.origin}${location.pathname}` : undefined;

	const meta = buildMeta({
		title,
		description,
		noIndex: rule.noIndex,
		canonicalUrl: rule.canonical !== false ? url : undefined,
		siteName: SITE_NAME
	});

	return (
		<Helmet>
			<title>{meta.fullTitle}</title>

			{meta.description && <meta name="description" content={meta.description} />}

			{meta.noIndex && <meta name="robots" content="noindex,nofollow" />}

			{meta.canonicalUrl && <link rel="canonical" href={meta.canonicalUrl} />}

			{/* Open Graph */}
			<meta property="og:title" content={meta.fullTitle} />
			{meta.description && <meta property="og:description" content={meta.description} />}
			{meta.canonicalUrl && <meta property="og:url" content={meta.canonicalUrl} />}
			<meta property="og:type" content="website" />

			{/* Twitter */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={meta.fullTitle} />
			{meta.description && <meta name="twitter:description" content={meta.description} />}
		</Helmet>
	);
}
