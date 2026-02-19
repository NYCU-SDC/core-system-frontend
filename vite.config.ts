import react from "@vitejs/plugin-react";
import fs from "fs";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

const mpaFallback: Plugin = {
	name: "mpa-fallback",
	configureServer(server) {
		const isAssetLike = (p: string) =>
			p.startsWith("/@") || p.startsWith("/src/") || p.startsWith("/node_modules/") || p.startsWith("/assets/") || p.startsWith("/api/") || p === "/favicon.ico" || p.includes(".");

		const isAdminPath = (p: string) => p === "/demo" || p.startsWith("/orgs");

		server.middlewares.use((req, _res, next) => {
			const original = req.url || "/";
			const [pathname, query] = original.split("?");
			if (isAssetLike(pathname)) return next();

			req.url = (isAdminPath(pathname) ? "/admin.html" : "/forms.html") + (query ? `?${query}` : "");
			next();
		});
	}
};

export default defineConfig({
	build: {
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			input: {
				admin: resolve(__dirname, "admin.html"),
				forms: resolve(__dirname, "forms.html")
			},
			onwarn(warning, warn) {
				// Many modern React libraries ship `"use client"` to support
				// React Server Components (Next.js App Router).
				// This Vite project is client-only (no RSC / SSR), so the directive
				// is irrelevant and safely ignored by Rollup.
				// We intentionally filter this warning to keep build output clean.
				if (warning.message.includes('"use client"')) return;
				warn(warning);
			}
		}
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "src")
		}
	},
	plugins: [
		react(),
		mpaFallback,

		visualizer({ open: true, filename: "dist/stats.html", gzipSize: true, brotliSize: true }),

		{
			name: "copy-lucide-static",
			configResolved() {
				const srcDir = resolve(process.cwd(), "node_modules/lucide-static/icons");
				const destDir = resolve(process.cwd(), "public/icons/lucide");
				fs.cpSync(srcDir, destDir, { recursive: true });
			}
		}
	],
	server: {
		proxy: {
			"/api": {
				target: "https://dev.core-system.sdc.nycu.club/",
				changeOrigin: true,
				secure: true, // HTTPS
				cookieDomainRewrite: {
					"dev.core-system.sdc.nycu.club": "localhost"
				}
			}
		}
	}
});
