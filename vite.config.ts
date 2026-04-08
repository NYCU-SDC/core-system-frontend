import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv, type Plugin } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "VITE_");
	const gaId = env.VITE_GA_ID ?? "";

	const injectGA: Plugin = {
		name: "inject-ga",
		transformIndexHtml(html: string) {
			if (!gaId) {
				// Remove the GA block entirely when no ID is provided
				return html.replace(/<!--\s*Google tag[\s\S]*?<\/script>\s*/g, "");
			}
			return html.replaceAll("%VITE_GA_ID%", gaId);
		}
	};

	return {
		build: {
			chunkSizeWarningLimit: 1000,
			rollupOptions: {
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
		plugins: [react(), injectGA, visualizer({ open: true, filename: "dist/stats.html", gzipSize: true, brotliSize: true })],
		server: {
			proxy: {
				"/api": {
					target: env.VITE_API_BASE_URL || "https://dev.core-system.sdc.nycu.club",
					changeOrigin: true,
					secure: false, // HTTPS
					cookieDomainRewrite: {
						"*": ""
					}
				}
			}
		}
	};
});
