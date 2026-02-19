import fastifyHttpProxy from "@fastify/http-proxy";
import fastifyStatic from "@fastify/static";
import { formsGetFormById } from "@nycu-sdc/core-system-sdk/dist/generated/index.js";
import Fastify from "fastify";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Agent, setGlobalDispatcher } from "undici";
import { buildMeta } from "../dist/seo/buildMeta.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, "../dist");

/* ================= CONFIG ================= */

const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://backend:8080";
const BACKEND_HOST_HEADER = process.env.BACKEND_HOST_HEADER || "dev.core-system.sdc.nycu.club";
const SITE_NAME = "Core System";

const FETCH_TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS || 3000);
const BREAKER_FAIL_THRESHOLD = Number(process.env.BREAKER_FAIL_THRESHOLD || 5);
const BREAKER_OPEN_MS = Number(process.env.BREAKER_OPEN_MS || 15000);
const UNDICI_CONNECTIONS = Number(process.env.UNDICI_CONNECTIONS || 50);

/* ================= UNDICI POOL ================= */

setGlobalDispatcher(
	new Agent({
		connections: UNDICI_CONNECTIONS,
		keepAliveTimeout: 10000,
		keepAliveMaxTimeout: 60000
	})
);

/* ================= SAFE FETCH ================= */

const originalFetch = globalThis.fetch.bind(globalThis);

function absolutify(input) {
	const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

	if (typeof url === "string" && url.startsWith("/")) {
		const absolute = new URL(url, BACKEND_ORIGIN).toString();

		if (typeof input === "string") return absolute;
		if (input instanceof URL) return new URL(absolute);

		// Request
		return new Request(absolute, input.clone());
	}

	return input;
}

function combineSignals(a, b) {
	if (!a) return b;
	if (!b) return a;

	if (AbortSignal.any) return AbortSignal.any([a, b]);

	const controller = new AbortController();
	const abort = () => controller.abort();
	a.addEventListener("abort", abort, { once: true });
	b.addEventListener("abort", abort, { once: true });
	return controller.signal;
}

async function fetchWithTimeout(input, init = {}) {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

	try {
		const signal = combineSignals(init.signal, controller.signal);
		return await originalFetch(input, { ...init, signal });
	} finally {
		clearTimeout(id);
	}
}

globalThis.fetch = (input, init) => {
	return fetchWithTimeout(absolutify(input), init);
};

/* ================= FASTIFY ================= */

const app = Fastify({ logger: true, ignoreTrailingSlash: true });

app.register(fastifyStatic, {
	root: DIST_DIR,
	prefix: "/",
	wildcard: false
});

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

/* ================= HELPERS ================= */

function escapeHtml(s) {
	return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function injectIntoHead(html, headTags) {
	if (html.includes("</head>")) {
		return html.replace("</head>", `${headTags}\n</head>`);
	}
	return html;
}

function getCanonicalUrl(req) {
	return `${req.protocol}://${req.headers.host}${req.url}`;
}

function renderMetaHead(meta) {
	const tags = [`<title>${escapeHtml(meta.fullTitle)}</title>`];

	if (meta.description) tags.push(`<meta name="description" content="${escapeHtml(meta.description)}" />`);

	if (meta.noIndex) tags.push(`<meta name="robots" content="noindex,nofollow" />`);

	if (meta.canonicalUrl) tags.push(`<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}" />`);

	return `\n    ${tags.join("\n    ")}\n  `;
}

/* ================= CACHE ================= */

class LruTtlCache {
	constructor({ max = 100, ttlMs = 30000 } = {}) {
		this.max = max;
		this.ttlMs = ttlMs;
		this.map = new Map();
	}

	get(key) {
		const entry = this.map.get(key);
		if (!entry) return;
		if (Date.now() > entry.expiresAt) {
			this.map.delete(key);
			return;
		}
		this.map.delete(key);
		this.map.set(key, entry);
		return entry.value;
	}

	set(key, value) {
		if (this.map.has(key)) this.map.delete(key);
		else if (this.map.size >= this.max) this.map.delete(this.map.keys().next().value);

		this.map.set(key, {
			value,
			expiresAt: Date.now() + this.ttlMs
		});
	}
}

const formMetaCache = new LruTtlCache({ max: 500, ttlMs: 30000 });

/* ================= CIRCUIT BREAKER ================= */

class CircuitBreaker {
	constructor() {
		this.failCount = 0;
		this.openUntil = 0;
	}

	isOpen() {
		return Date.now() < this.openUntil;
	}

	success() {
		this.failCount = 0;
		this.openUntil = 0;
	}

	fail() {
		this.failCount++;
		if (this.failCount >= BREAKER_FAIL_THRESHOLD) {
			this.openUntil = Date.now() + BREAKER_OPEN_MS;
		}
	}
}

const breaker = new CircuitBreaker();

/* ================= ROUTES ================= */

const TEMPLATES = {
	forms: await fs.readFile(path.join(DIST_DIR, "forms.html"), "utf8"),
	admin: await fs.readFile(path.join(DIST_DIR, "admin.html"), "utf8")
};

async function handleFormSeoRoute(req, reply) {
	const { formId } = req.params;

	let title = "Form";
	let description = "";

	const cached = formMetaCache.get(formId);

	if (cached) {
		title = cached.title;
		description = cached.description;
	} else if (!breaker.isOpen()) {
		try {
			const res = await formsGetFormById(formId);

			if (res.status >= 200 && res.status < 300) {
				title = res.data.title || title;
				description = res.data.description || description;
				formMetaCache.set(formId, { title, description });
				breaker.success();
			} else {
				breaker.fail();
			}
		} catch (e) {
			breaker.fail();
			req.log.warn({ err: e }, "backend meta fetch failed");
		}
	}

	const meta = buildMeta({
		title,
		description,
		siteName: SITE_NAME,
		canonicalUrl: getCanonicalUrl(req)
	});

	reply
		.header("content-type", "text/html; charset=utf-8")
		.header("cache-control", "no-store")
		.header("awesome-club", "NYCU SDC")
		.send(injectIntoHead(TEMPLATES.forms, renderMetaHead(meta)));
}

app.get("/forms/:formId", handleFormSeoRoute);
app.get("/forms/:formId/:responseId", handleFormSeoRoute);

app.get("/*", (_req, reply) => {
	reply.header("content-type", "text/html; charset=utf-8").send(TEMPLATES.forms);
});

const port = Number(process.env.PORT || 80);
app.listen({ port, host: "0.0.0.0" });
