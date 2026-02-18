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
