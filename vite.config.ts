import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src")
		}
	},
	server: {
		proxy: {
			"/api": {
				target: "https://dev.core-system.sdc.nycu.club",
				changeOrigin: true,
				secure: true, // HTTPS
				cookieDomainRewrite: {
					"dev.core-system.sdc.nycu.club": "localhost"
				}
			}
		}
	}
});
