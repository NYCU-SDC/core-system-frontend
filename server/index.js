import fastifyHttpProxy from "@fastify/http-proxy";
import fastifyStatic from "@fastify/static";
import { formsGetFormById } from "@nycu-sdc/core-system-sdk/dist/generated/index.js";
import Fastify from "fastify";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildMeta } from "../dist/seo/buildMeta.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, "../dist");

// 你可以用環境變數控制：
// BACKEND_ORIGIN=http://backend:8080
// BACKEND_HOST_HEADER=dev.core-system.sdc.nycu.club (只有你真的需要 Host-based routing 才用)
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://backend:8080";
const BACKEND_HOST_HEADER = process.env.BACKEND_HOST_HEADER || "dev.core-system.sdc.nycu.club";
const SITE_NAME = "Core System";

// SDK 產生的函式使用相對路徑（/api/...），在 Node.js 中需要補上 origin。
// 這裡 patch 全域 fetch，讓所有相對路徑自動指向後端。
const _originalFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
	const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
	if (typeof url === "string" && url.startsWith("/")) {
		const absolute = new URL(url, BACKEND_ORIGIN).toString();
		input = typeof input === "string" ? absolute : input instanceof URL ? new URL(absolute) : new Request(absolute, input);
	}
	return _originalFetch(input, init);
};

const app = Fastify({ logger: true, ignoreTrailingSlash: true });

// 1) 靜態資源：讓 /assets/*、/forms.html、/admin.html 都能被取到
// wildcard: false 避免 @fastify/static 自己註冊 /* 與後面的 catch-all 衝突
app.register(fastifyStatic, {
	root: DIST_DIR,
	prefix: "/",
	wildcard: false
});

// 2) /api 反向代理到 Go 後端
app.register(fastifyHttpProxy, {
	upstream: BACKEND_ORIGIN,
	prefix: "/api",
	rewritePrefix: "/api",
	replyOptions: {
		rewriteRequestHeaders: (_req, headers) => {
			if (!BACKEND_HOST_HEADER) return headers;
			return { ...headers, host: BACKEND_HOST_HEADER };
		}
	}
});

function escapeHtml(s) {
	return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function injectIntoHead(html, headTags) {
	if (html.includes("</head>")) return html.replace("</head>", `${headTags}\n</head>`);
	return html;
}

function getCanonicalUrl(req) {
	return `${req.protocol}://${req.headers.host}${req.url}`;
}

function renderMetaHead(meta) {
	const tags = [`<title>${escapeHtml(meta.fullTitle)}</title>`];

	if (meta.description) {
		tags.push(`<meta name="description" content="${escapeHtml(meta.description)}" />`);
	}
	if (meta.noIndex) {
		tags.push(`<meta name="robots" content="noindex,nofollow" />`);
	}
	if (meta.canonicalUrl) {
		tags.push(`<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />`);
	}

	tags.push(`<meta property="og:title" content="${escapeHtml(meta.fullTitle)}" />`);
	if (meta.description) {
		tags.push(`<meta property="og:description" content="${escapeHtml(meta.description)}" />`);
	}
	if (meta.canonicalUrl) {
		tags.push(`<meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}" />`);
	}
	tags.push(`<meta property="og:type" content="website" />`);
	tags.push(`<meta name="twitter:card" content="summary_large_image" />`);
	tags.push(`<meta name="twitter:title" content="${escapeHtml(meta.fullTitle)}" />`);
	if (meta.description) {
		tags.push(`<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`);
	}

	return `\n    ${tags.join("\n    ")}\n  `;
}

const TEMPLATES = {
	forms: await fs.readFile(path.join(DIST_DIR, "forms.html"), "utf8"),
	admin: await fs.readFile(path.join(DIST_DIR, "admin.html"), "utf8")
};

class LruTtlCache {
	#map = new Map();
	#max;
	#ttlMs;

	constructor({ max = 100, ttlMs = 30_000 } = {}) {
		this.#max = max;
		this.#ttlMs = ttlMs;
	}

	get(key) {
		const entry = this.#map.get(key);
		if (!entry) return undefined;
		if (Date.now() > entry.expiresAt) {
			this.#map.delete(key);
			return undefined;
		}
		// LRU：重新插入到末尾
		this.#map.delete(key);
		this.#map.set(key, entry);
		return entry.value;
	}

	set(key, value) {
		if (this.#map.has(key)) this.#map.delete(key);
		else if (this.#map.size >= this.#max) {
			this.#map.delete(this.#map.keys().next().value);
		}
		this.#map.set(key, { value, expiresAt: Date.now() + this.#ttlMs });
	}
}

const formMetaCache = new LruTtlCache({ max: 500, ttlMs: 30_000 });

// 3) forms 頁：動態 meta（這是 SEO 核心）
// 同時處理 /forms/:formId 和 /forms/:formId/:responseId
async function handleFormSeoRoute(req, reply) {
	const { formId } = req.params;

	const template = TEMPLATES.forms;

	// 透過 SDK 向後端拿 meta 資料（LRU + 30s TTL 快取）
	let title = "Form";
	let description = "";

	const cached = formMetaCache.get(formId);
	if (cached) {
		title = cached.title;
		description = cached.description;
	} else {
		try {
			const res = await formsGetFormById(formId, {
				headers: BACKEND_HOST_HEADER ? { host: BACKEND_HOST_HEADER } : undefined
			});

			if (res.status >= 200 && res.status < 300) {
				title = res.data.title || title;
				description = res.data.description || description;
				formMetaCache.set(formId, { title, description });
			}
		} catch (e) {
			req.log.warn({ err: e }, "failed to fetch form meta");
		}
	}

	const meta = buildMeta({
		title,
		description,
		siteName: SITE_NAME,
		canonicalUrl: getCanonicalUrl(req)
	});
	const head = renderMetaHead(meta);

	reply
		.header("content-type", "text/html; charset=utf-8")
		// 個人化/動態內容通常不要被 CDN 亂 cache
		.header("cache-control", "no-store")
		.header("awesome-club", "NYCU SDC")
		.send(injectIntoHead(template, head));
}

app.get("/forms/:formId", handleFormSeoRoute);
app.get("/forms/:formId/:responseId", handleFormSeoRoute);

// 4) forms 其他頁（list / public routes）回 forms.html（SEO 由 CSR 處理）
const FORMS_HTML_ROUTES = ["/", "/callback", "/welcome", "/logout", "/forms", "/forms/*"];
for (const r of FORMS_HTML_ROUTES) {
	app.get(r, (_req, reply) => {
		reply.header("content-type", "text/html; charset=utf-8").send(TEMPLATES.forms);
	});
}

// 5) admin app：/orgs/*、/demo 都回 admin.html
for (const r of ["/orgs/*", "/demo"]) {
	app.get(r, (req, reply) => {
		const pathname = req.url.split("?")[0];
		const title = pathname === "/demo" ? "Components Demo" : "Admin";
		const meta = buildMeta({
			title,
			description: "Core System admin console",
			noIndex: true,
			siteName: SITE_NAME,
			canonicalUrl: getCanonicalUrl(req)
		});

		reply.header("content-type", "text/html; charset=utf-8").send(injectIntoHead(TEMPLATES.admin, renderMetaHead(meta)));
	});
}

// 6) 其他全部回 forms.html（注入 404 / noindex meta）
app.get("/*", (_req, reply) => {
	const meta = buildMeta({
		title: "404",
		description: "Page not found",
		noIndex: true,
		siteName: SITE_NAME
	});

	reply.header("content-type", "text/html; charset=utf-8").send(injectIntoHead(TEMPLATES.forms, renderMetaHead(meta)));
});

const port = Number(process.env.PORT || 80);
app.listen({ port, host: "0.0.0.0" });
