import react from "@vitejs/plugin-react";
import fs from "fs";
import { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

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
				secure: false, // HTTPS
				cookieDomainRewrite: {
					"dev.core-system.sdc.nycu.club": "localhost"
				}
			}
		}
	}
});
