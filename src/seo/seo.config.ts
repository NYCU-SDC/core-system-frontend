import { extractTextFromProseMirror } from "@/shared/utils/proseMirror";

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
	description?: unknown;
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

	adminFormDetail: {
		title: ({ data }) => {
			const title = (data as FormSeoData | undefined)?.title;
			return title ? `編輯 - ${title}` : "編輯表單";
		},
		noIndex: true
	},

	adminFormPreview: {
		title: ({ data }) => {
			const title = (data as FormSeoData | undefined)?.title;
			return title ? `預覽 - ${title}` : "預覽表單";
		},
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
	oauthLink: {
		title: "帳號合併確認",
		description: "請確認是否將兩個登入方式合併",
		noIndex: true,
		canonical: false
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
		description: ({ data }) => {
			const desc = (data as FormSeoData | undefined)?.description;
			return desc ? extractTextFromProseMirror(desc) : undefined;
		}
	}
};
