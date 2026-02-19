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
		title: "首頁",
		description: "NYCU SDC 製作"
	},

	formsList: {
		title: "我的表單",
		description: "管理你的表單"
	},

	adminForms: {
		title: "表單管理",
		noIndex: true
	},

	adminPage: {
		title: "管理後台",
		noIndex: true
	},

	callback: {
		title: "登入中...",
		description: "正在使用第三方服務登入，請稍候...",
		noIndex: true,
		canonical: false
	},

	welcome: {
		title: "歡迎使用 Core System！",
		description: "完成你的帳戶設定，開始使用 Core System 吧！",
		noIndex: true
	},

	logout: {
		title: "登出中...",
		description: "正在登出 Core System",
		noIndex: true,
		canonical: false
	},

	notFound: {
		title: "找不到頁面",
		description: "你要找的頁面不存在或已被刪除。",
		noIndex: true,
		canonical: false
	},

	formDetail: {
		title: ({ data }) => (data as FormSeoData | undefined)?.title ?? "表單",
		description: ({ data }) => (data as FormSeoData | undefined)?.description
	}
};
