export interface SeoRuleContext {
	params: Record<string, string>;
	data?: unknown; // 可放 react-query / loader 取得的資料
}

export interface SeoRule {
	title: string | ((ctx: SeoRuleContext) => string);
	description?: string | ((ctx: SeoRuleContext) => string | undefined);
	noIndex?: boolean;
	canonical?: boolean;
}

interface FormSeoData {
	title?: string;
	description?: string;
}

export const SEO_CONFIG: Record<string, SeoRule> = {
	home: {
		title: "Home",
		description: "Core System homepage"
	},

	formsList: {
		title: "My Forms",
		description: "View and complete your assigned forms"
	},

	adminForms: {
		title: "Admin Forms",
		noIndex: true
	},

	adminPage: {
		title: "Admin",
		noIndex: true
	},

	callback: {
		title: "Sign In",
		description: "Processing sign-in",
		noIndex: true,
		canonical: false
	},

	welcome: {
		title: "Welcome",
		description: "Complete your profile setup",
		noIndex: true
	},

	logout: {
		title: "Sign Out",
		description: "Signing out from Core System",
		noIndex: true,
		canonical: false
	},

	notFound: {
		title: "404",
		description: "Page not found",
		noIndex: true,
		canonical: false
	},

	formDetail: {
		title: ({ data }) => (data as FormSeoData | undefined)?.title ?? "Form",
		description: ({ data }) => (data as FormSeoData | undefined)?.description
	}
};
