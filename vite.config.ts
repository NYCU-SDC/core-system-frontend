import react from "@vitejs/plugin-react";
import fs from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
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
	plugins: [
		react(),
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
				target: "http://localhost:4010",
				changeOrigin: true,
				secure: false, // HTTPS
				cookieDomainRewrite: {
					"localhost:4010": "localhost"
				}
			}
		}
	}
});
