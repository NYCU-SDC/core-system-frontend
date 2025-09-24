import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],

	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src")
		}
	},
	/*server: {
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
	}*/
});
