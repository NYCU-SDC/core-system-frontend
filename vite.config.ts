import fs from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";

function copyDir(src: string, dest: string) {
	if (!fs.existsSync(src)) {
		console.error("lucide-static not found:", src);
		return;
	}

	if (!fs.existsSync(dest)) {
		fs.mkdirSync(dest, { recursive: true });
	}

	const entries = fs.readdirSync(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = resolve(src, entry.name);
		const destPath = resolve(dest, entry.name);

		if (entry.isDirectory()) {
			copyDir(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

export default defineConfig({
	build: {
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			onwarn(warning, warn) {
				// Silence Rollup warnings for `"use client"` directives.
				//
				// Many modern React libraries ship `"use client"` to support
				// React Server Components (Next.js App Router).
				//
				// This Vite project is client-only (no RSC / SSR), so the directive
				// is irrelevant and safely ignored by Rollup.
				// We intentionally filter this warning to keep build output clean.
				if (warning.message.includes('"use client"')) {
					return;
				}
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
		{
			name: "copy-lucide-static",
			configResolved() {
				const srcDir = resolve(process.cwd(), "node_modules/lucide-static/icons");
				const destDir = resolve(process.cwd(), "public/icons/lucide");
				copyDir(srcDir, destDir);
			}
		}
	]
});
