import fastifyHttpProxy from "@fastify/http-proxy";
import fastifyStatic from "@fastify/static";
import { formsGetFormById } from "@nycu-sdc/core-system-sdk";
import Fastify from "fastify";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, "../dist");

// 你可以用環境變數控制：
// BACKEND_ORIGIN=http://backend:8080
// BACKEND_HOST_HEADER=dev.core-system.sdc.nycu.club (只有你真的需要 Host-based routing 才用)
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://backend:8080";
const BACKEND_HOST_HEADER = process.env.BACKEND_HOST_HEADER || "dev.core-system.sdc.nycu.club";

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

const app = Fastify({ logger: true });

// 1) 靜態資源：讓 /assets/*、/forms.html、/admin.html 都能被取到
app.register(fastifyStatic, {
	root: DIST_DIR,
	prefix: "/"
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

async function readHtml(name) {
	return await fs.readFile(path.join(DIST_DIR, name), "utf8");
}

// 3) forms 頁：動態 meta（這是 SEO 核心）
// 你目前的表單 detail route：/forms/:formId/:responseId
app.get("/forms/:formId/:responseId", async (req, reply) => {
	const { formId } = req.params;

	const template = await readHtml("forms.html");

	// 透過 SDK 向後端拿 meta 資料
	let title = "Form";
	let description = "";

	try {
		const res = await formsGetFormById(formId, {
			headers: BACKEND_HOST_HEADER ? { host: BACKEND_HOST_HEADER } : undefined
		});

		if (res.status >= 200 && res.status < 300) {
			title = res.data.title || title;
			description = res.data.description || description;
		}
	} catch (e) {
		req.log.warn({ err: e }, "failed to fetch form meta");
	}

	const canonical = `${req.protocol}://${req.headers.host}${req.url}`;

	const head = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />

    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
  `;

	reply
		.header("content-type", "text/html; charset=utf-8")
		// 個人化/動態內容通常不要被 CDN 亂 cache
		.header("cache-control", "no-store")
		.send(injectIntoHead(template, head));
});

// 4) forms 其他頁（list / public routes）回 forms.html（不做動態 meta 也行）
const FORMS_HTML_ROUTES = ["/", "/callback", "/welcome", "/logout", "/forms", "/forms/*"];
for (const r of FORMS_HTML_ROUTES) {
	app.get(r, async (_req, reply) => {
		const html = await readHtml("forms.html");
		reply.header("content-type", "text/html; charset=utf-8").send(html);
	});
}

// 5) admin app：/orgs/*、/demo 都回 admin.html
app.get(["/orgs/*", "/demo"], async (_req, reply) => {
	const html = await readHtml("admin.html");
	reply.header("content-type", "text/html; charset=utf-8").send(html);
});

// 6) 其他全部回 forms.html（或你想回 404）
app.get("/*", async (_req, reply) => {
	const html = await readHtml("forms.html");
	reply.header("content-type", "text/html; charset=utf-8").send(html);
});

const port = Number(process.env.PORT || 80);
app.listen({ port, host: "0.0.0.0" });
